package core

import (
	"encoding/base64"
	"fmt"
	"os"
	"strings"
)

//CompareSecrets takes a secret that's about to be applied and compares it to a
//secret that already exists on the server. It checks for values that will be added
//newly, values that will be removed from the server if the secret is applying, and
//which values will be changed. It also warns about potential errors in the base64
//encoded values such as strings starting or ending with spaces or newlines. It returns
//this as a map[string]string where the keys of the map are changes, additions, removals,
//and warnings.
func CompareSecrets(secretToBeApplied, existingSecret Secret) map[string]string {
	compareResults := map[string]string{
		"changes":   "",
		"additions": "",
		"removals":  "",
		"warnings":  "",
	}
	for k, v := range secretToBeApplied.Data {
		lv, err := base64.StdEncoding.DecodeString(v)
		if err != nil {
			fmt.Printf("Error while decoding local value for %s\n", k)
			os.Exit(1)
		}
		localDecodedValue := string(lv)
		if strings.HasPrefix(localDecodedValue, " ") {
			compareResults["warnings"] += fmt.Sprintf("POSSIBLE ERROR: Value for %s begins with a space: The value is \"%s\"\n", k, localDecodedValue)
		}
		if strings.HasSuffix(localDecodedValue, " ") {
			compareResults["warnings"] += fmt.Sprintf("POSSIBLE ERROR: Value for %s ends with a space: The value is \"%s\"\n", k, localDecodedValue)
		}
		if strings.HasSuffix(localDecodedValue, "\n") {
			compareResults["warnings"] += fmt.Sprintf("POSSIBLE ERROR: Value for %s ends with a new line: The value is \"%s\"\n", k, localDecodedValue)
		}
		if existingSecretValue, exists := existingSecret.Data[k]; exists {

			rv, err := base64.StdEncoding.DecodeString(existingSecretValue)
			if err != nil {
				fmt.Printf("Error while decoding remote value for %s\n", k)
				os.Exit(1)
			}
			remoteDecodedValue := string(rv)
			if localDecodedValue != remoteDecodedValue {
				compareResults["changes"] += fmt.Sprintf("Change in %s \nValue on server (old): %s\nValue to be applied (new): %s\n\n", k, remoteDecodedValue, localDecodedValue)
			}
		} else {
			if decodedValue, err := base64.StdEncoding.DecodeString(v); err != nil {
				fmt.Printf("Error while decoding %s: %s", v, err)
				os.Exit(1)
			} else {
				compareResults["additions"] += fmt.Sprintf("%s will be added newly to the secret. New value:\nDecoded: %s\nEncoded: %s\n\n", k, decodedValue, v)
			}
		}
	}
	for k, v := range existingSecret.Data {
		if _, exists := secretToBeApplied.Data[k]; !exists {
			rv, err := base64.StdEncoding.DecodeString(v)
			if err != nil {
				fmt.Printf("Error while decoding remote value for %s\n", k)
				os.Exit(1)
			}
			compareResults["removals"] += fmt.Sprintf("WARN: %s exists only in server and will be removed upon applying. Value for the key is: %s", k, string(rv))
		}
	}
	return compareResults
}
