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
				compareResults["changes"] += fmt.Sprintf("  * %s:\n    * NEW value: %s\n    * OLD value: %s\n", k, localDecodedValue, remoteDecodedValue)
			}
		} else {
			if decodedValue, err := base64.StdEncoding.DecodeString(v); err != nil {
				fmt.Printf("Error while decoding %s: %s", v, err)
				os.Exit(1)
			} else {
				compareResults["additions"] += fmt.Sprintf("  * %s:\n    * Decoded: %s\n    * Encoded: %s\n\n", k, decodedValue, v)
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
			compareResults["removals"] += fmt.Sprintf("  * WARN: %s will be deleted from the server.\n    * Value: %s", k, string(rv))
		}
	}
	return compareResults
}
