package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"regexp"
	"strings"
)

func main() {
	extensions := readRepoExtensions()
	
	// Tạo file index.json
	f, err := os.Create("index.json")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	b, err := json.MarshalIndent(extensions, "", " ")
	if err != nil {
		log.Fatal(err)
	}
	f.Write(b)

	// Tạo file README.md
	f2, err2 := os.Create("README.md")
	if err2 != nil {
		log.Fatal(err2) // Đã sửa lỗi err thành err2 ở đây
	}
	defer f2.Close()

	readme := `
# Miru-Repo

Miru extensions repository | [Miru App Download](https://github.com/miru-project/miru-app) |

## List
|  Name   | Package | Version | Author | Language | Type | Source |
|  ----   | ---- | --- | ---  | ---  | --- | --- |
`

	for _, v := range extensions {
		// v["url"] lúc này đã bao gồm "?raw=true" từ hàm readRepoExtensions
		// Thay đổi 'blob' thành 'raw' để link trực tiếp đến file code
		rawUrl := "https://github.com/miru-project/repo/raw/main/repo/" + v["url"]
		urlMarkdown := fmt.Sprintf("[Source Code](%s)", rawUrl)
		
		nsfw := v["nsfw"] == "true"
		if nsfw {
			continue
		}
		readme += fmt.Sprintf("| %s | %s | %s | %s | %s | %s | %s |\n", v["name"], v["package"], v["version"], v["author"], v["lang"], v["type"], urlMarkdown)
	}
	f2.WriteString(readme)
	fmt.Println("Đã cập nhật index.json và README.md với URL raw thành công!")
}

func readRepoExtensions() []map[string]string {
	de, err := os.ReadDir("repo")
	if err != nil {
		log.Fatal(err)
	}
	var extensions []map[string]string
	for _, de2 := range de {
		// Bỏ qua nếu là thư mục
		if de2.IsDir() {
			continue
		}
		
		b, err := os.ReadFile(path.Join("repo", de2.Name()))
		if err != nil {
			log.Println("error:", err)
			continue
		}
		
		r, _ := regexp.Compile(`MiruExtension([\s\S]+?)/MiruExtension`)
		data := r.FindAllString(string(b), -1)
		if len(data) < 1 {
			log.Println("error: not extension in file", de2.Name())
			continue
		}
		
		lines := strings.Split(data[0], "\n")
		extension := make(map[string]string)
		for _, v := range lines {
			if len(v) > 4 && v[:4] == "// @" {
				s := strings.Split(v[4:], " ")
				if len(s) >= 1 {
					extension[s[0]] = strings.Trim(s[len(s)-1], "\r")
				}
			}
		}
		
		// QUAN TRỌNG: Thêm ?raw=true vào cuối tên file cho trường url
		extension["url"] = de2.Name() + "?raw=true"
		extensions = append(extensions, extension)
	}
	return extensions
}
