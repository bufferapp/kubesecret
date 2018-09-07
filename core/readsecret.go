package core

import (
	"errors"
	"io/ioutil"
	"os"

	"gopkg.in/yaml.v2"
)

//ReadSecretFromFile takes a filename and reads the values to generate
//a Secret type struct.
func ReadSecretFromFile(filename string) (Secret, error) {
	_, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return Secret{}, errors.New("File does not exist")
	}
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return Secret{}, err
	}
	var secretToReturn Secret
	if err := yaml.Unmarshal(data, &secretToReturn); err != nil {
		return Secret{}, err
	}
	return secretToReturn, nil
}
