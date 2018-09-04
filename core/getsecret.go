package core

import (
	"encoding/json"
	"errors"
	"log"
	"os/exec"
	"strings"
)

type metadata struct {
	Name      string `json:"Name"`
	Namespace string `json:"namespace"`
}
type Secret struct {
	APIVersion string            `json:"apiVersion"`
	Type       string            `json:"type"`
	Kind       string            `json:"kind"`
	Metadata   metadata          `json:"metadata"`
	Data       map[string]string `json:"data"`
}

type secrets struct {
	APIVersion string   `json:"apiVersion"`
	Items      []Secret `json:"Items"`
}

// GetSecrets Executes the kubectl command line
func GetSecrets(namespace string) {
	log.Println("Executing kubectl")
	out, _ := exec.Command("kubectl", "get", "secrets", "--namespace", "buffer", "-o", "json").CombinedOutput()

	var dataRetrived map[string]interface{}
	if err := json.Unmarshal(out, &dataRetrived); err != nil {
		log.Fatal(err)
	}
	for k := range dataRetrived {
		log.Println(k)
	}

	var secretsRetrieved secrets
	if err := json.Unmarshal(out, &secretsRetrieved); err != nil {
		log.Fatal(err)
	}
	log.Printf("Length of items: %d\n", len(secretsRetrieved.Items))
	log.Println(secretsRetrieved.Items[0].APIVersion)
	log.Println(len(secretsRetrieved.Items[0].Data))
	log.Println(secretsRetrieved.Items[0].Metadata.Name)
	for _, secretRetrieved := range secretsRetrieved.Items {
		log.Println(secretRetrieved.Metadata.Name)
		for k, v := range secretRetrieved.Data {
			log.Printf("%s: %s\n", k, v)
		}
	}
}

// GetSecretsByNamespaceAndName returns a secret for a given namespace and secret name
func GetSecretsByNamespaceAndName(namespace, secretName string) (Secret, error) {
	if namespace == "" || secretName == "" {
		return Secret{}, errors.New("Namespace or secretName cannot be empty")
	}
	out, _ := exec.Command("kubectl", "get", "secret", "--namespace", namespace, secretName, "-o", "json").CombinedOutput()
	var secretRetrieved Secret
	if strings.Contains(string(out), "Error from server (NotFound)") {
		return Secret{}, errors.New(string(out))
	}
	if err := json.Unmarshal(out, &secretRetrieved); err != nil {
		return Secret{}, err
	}
	return secretRetrieved, nil
}
