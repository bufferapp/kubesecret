package core

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
