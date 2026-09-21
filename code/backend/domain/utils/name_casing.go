package utils

import "strings"

func TitleToCamelCase(s string) string {
	if len(s) == 0 {
		return s
	}

	return strings.ToLower(string(s[0])) + s[1:]
}

func SnakeToTitleCase(s string) string {
	words := strings.Split(s, "_")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(string(word[0])) + strings.ToLower(word[1:])
		}
	}

	return strings.Join(words, "")
}

func TitleToKebabCase(s string) string {
	result := ""

	for i := 0; i < len(s); i++ {
		c := s[i]

		if i > 0 && c >= 'A' && c <= 'Z' {
			result += "-"
		}
		result += string(c)
	}

	return strings.ToLower(result)
}