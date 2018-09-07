package core

import (
	"encoding/base64"
	"fmt"
	"os"
)

func CompareSecrets(secretToBeApplied, existingSecret Secret) map[string]string {
	compareResults := map[string]string{
		"changes":   "",
		"additions": "",
		"removals":  "",
	}
	for k, v := range secretToBeApplied.Data {
		if existingSecretValue, exists := existingSecret.Data[k]; exists {
			lv, err := base64.StdEncoding.DecodeString(v)
			if err != nil {
				fmt.Printf("Error while decoding local value for %s\n", k)
				os.Exit(1)
			}
			localDecodedValue := string(lv)
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
			compareResults["removals"] += fmt.Sprintf("WARN: %s exists only in server and will be overwritten. Value for the key is: %s", k, string(rv))
		}
	}
	return compareResults
}
