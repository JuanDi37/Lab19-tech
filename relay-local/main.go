// Relay local de laboratorio. No es strfry ni un relay del instructor.
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"fiatjaf.com/nostr"
	"fiatjaf.com/nostr/eventstore/slicestore"
	"fiatjaf.com/nostr/khatru"
)

func main() {
	rl := khatru.NewRelay()
	rl.Info.Name = "CS031 Lab 19 - relay local"
	rl.Info.Description = "Adaptacion local con Khatru; no es strfry ni el relay del instructor."
	rl.UseEventstore(&slicestore.SliceStore{}, 2)
	rl.OnEvent = func(ctx context.Context, event nostr.Event) (bool, string) {
		blocked, err := os.ReadFile("relay-local/banned-pubkey.txt")
		reason := ""
		if err != nil && !os.IsNotExist(err) {
			reason = "error: cannot read local ban policy"
		} else if strings.TrimSpace(string(blocked)) == event.PubKey.Hex() {
			reason = "blocked: test pubkey banned on local lab relay"
		} else if event.Kind != 1 || (event.Content != "CS031 Lab 19 · nota de prueba" && event.Content != "CS031 Lab 19 · nota de prueba #2") || len(event.Tags) != 1 || len(event.Tags[0]) != 2 || event.Tags[0][0] != "t" || event.Tags[0][1] != "cs031lab19" {
			reason = "blocked: only the two fixed lab notes are allowed"
		}
		entry, _ := json.Marshal(map[string]any{"time": time.Now().UTC().Format(time.RFC3339Nano), "id": event.ID.Hex(), "pubkey": event.PubKey.Hex(), "rejected": reason != "", "reason": reason})
		log.Print(string(entry))
		return reason != "", reason
	}
	log.Print("Listening on ws://127.0.0.1:10547; storage in memory; ban policy: relay-local/banned-pubkey.txt")
	log.Fatal(http.ListenAndServe("127.0.0.1:10547", rl))
}
