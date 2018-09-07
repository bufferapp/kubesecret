package core

type metadata struct {
	Name      string `json:"Name"`
	Namespace string `json:"namespace"`
}

//Secret is the main type that has all the information we care about in a
//secret file. It can be used to regenerate a secret document afresh.
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
