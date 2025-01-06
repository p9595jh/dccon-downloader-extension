package main

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/rs/cors"
)

type ImgInfo struct {
	Source string `json:"src"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		reqBody, err := io.ReadAll(r.Body)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(http.StatusText(http.StatusInternalServerError)))
			return
		}
		defer r.Body.Close()

		var imgInfo ImgInfo
		if err := json.Unmarshal(reqBody, &imgInfo); err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(http.StatusText(http.StatusInternalServerError)))
			return
		}

		req, err := http.NewRequest("GET", imgInfo.Source, nil)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(http.StatusText(http.StatusInternalServerError)))
			return
		}
		req.Header.Add("Referer", "https://dccon.dcinside.com/")

		res, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(http.StatusText(http.StatusInternalServerError)))
			return
		}

		dataBody, err := io.ReadAll(res.Body)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(http.StatusText(http.StatusInternalServerError)))
			return
		}
		defer res.Body.Close()
		data := base64.StdEncoding.EncodeToString(dataBody)

		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte(data))
	})

	handler := cors.Default().Handler(mux)
	if err := http.ListenAndServe(":4000", handler); err != nil {
		log.Fatal(err)
	}
}
