package cmd

import (
	"fmt"
	"log"
	"sort"

	"encoding/base64"

	"github.com/bufferapp/kubesecret/core"
	"github.com/spf13/cobra"
)

var namespace string
var secretKey string
var allKeys bool

var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Gets the keys and their values for a given secret",
	Run: func(cmd *cobra.Command, args []string) {
		s, err := core.GetSecretsByNamespaceAndName(namespace, args[0])
		if err == nil {
			keys := make([]string, 0, len(s.Data))
			for k := range s.Data {
				keys = append(keys, k)
			}
			sort.Strings(keys)

			if secretKey == "" {
				if allKeys {
					fmt.Printf("List of keys with associated values\n\n")
					for _, k := range keys {
						value, err := base64.StdEncoding.DecodeString(s.Data[k])
						if err != nil {
							log.Fatalln(err)
						} else {
							fmt.Printf("%s: %s\n ------------ \n", k, value)
						}
					}
					fmt.Printf("\n\n")
				}
				fmt.Printf("List of all keys for %s\n\n", args[0])
				for _, k := range keys {
					fmt.Printf("%s\n", k)
				}
				fmt.Printf("\n\nUse kubesecret get %s -k key --namespace %s to print the value for a specific key\n", args[0], namespace)
			} else {
				found := false
				for k, v := range s.Data {
					if found {
						break
					} else {
						if k == secretKey {
							found = true
							decodedValue, err := base64.StdEncoding.DecodeString(v)
							if err != nil {
								log.Fatalln(err)
							} else {
								fmt.Printf("%s: %s\n", k, decodedValue)
							}
						}
					}
				}
				if !found {
					fmt.Println("Could not find the key specified")
				}
			}
		} else {
			fmt.Println(err)
		}
	},
	Args: cobra.ExactArgs(1),
}

func init() {
	rootCmd.AddCommand(getCmd)
	getCmd.Flags().StringVarP(&namespace, "namespace", "n", "", "Namespace to search for secret in. (Required)")
	getCmd.Flags().StringVarP(&secretKey, "key", "k", "", "Specific key value to get")
	getCmd.Flags().BoolVar(&allKeys, "all-keys", false, "List the values of all the keys")
	getCmd.MarkFlagRequired("namespace")
}
