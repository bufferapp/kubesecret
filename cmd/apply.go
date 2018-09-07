package cmd

import (
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/bufferapp/kubesecret/core"
	"github.com/spf13/cobra"
)

var applyCmd = &cobra.Command{
	Use:   "apply",
	Short: "Checks for conflicts and applies the changes in a given secret file to kubernetes",
	Run: func(cmd *cobra.Command, args []string) {
		secretFromFile, err := core.ReadSecretFromFile(args[0])
		var answer []byte
		if err != nil {
			log.Println("Something went wrong while reading the file")
			log.Fatalln(err)
		}
		fmt.Println("Secret read from file. Checking the matching remote resource now.")
		secretFromServer, err := core.GetSecretsByNamespaceAndName(secretFromFile.Metadata.Namespace, secretFromFile.Metadata.Name)

		if err != nil {
			if err.Error() == "Could not find the secret" {

				keyAndData := ""
				for k, v := range secretFromFile.Data {
					keyAndData += "  " + k + ": " + v
				}
				fmt.Printf(`
Could not find secret remotely.

These are the details of the secret that will be created:

Name: %s
Namespace: %s
Keys:
%s

Are you sure you wish to create this secret newly? (y/n): `, secretFromFile.Metadata.Name, secretFromFile.Metadata.Namespace, keyAndData)
				fmt.Scanln(&answer)
				if string(answer) == "y" {
					fmt.Println("Creating the secret")
					out, _ := exec.Command("kubectl", "apply", "-f", args[0]).CombinedOutput()
					fmt.Printf(string(out))
				} else {
					fmt.Println("Cancelling applying secret")
				}
			}
		} else {
			changes := core.CompareSecrets(secretFromFile, secretFromServer)
			if changes["removals"] != "" {
				fmt.Printf("Please review the below warnings:\n%s", changes["removals"])
				fmt.Printf("\n\nDo you wish to proceed with these values being removed? (y/n): ")
				fmt.Scanln(&answer)
				if string(answer) == "n" {
					fmt.Printf("Cancelling applying changes\n")
					os.Exit(0)
				}
			}
			fmt.Println("Changes:\n\n" + changes["changes"])
			fmt.Println("Additions:\n\n" + changes["additions"])
			fmt.Printf("Do you wish to proceed with applying these changes? (y/n): ")
			fmt.Scanln(&answer)
			if string(answer) == "y" {
				fmt.Println("Applying the changes")
				out, _ := exec.Command("kubectl", "apply", "-f", args[0]).CombinedOutput()
				fmt.Printf(string(out))
			} else {
				fmt.Println("Cancelling applying secret")
			}

		}

	},
	Args: cobra.ExactArgs(1),
}

func init() {
	rootCmd.AddCommand(applyCmd)
}
