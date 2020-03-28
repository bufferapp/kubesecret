# Kubesecret - Safe kubernetes secret management

## Purpose and motivation

Managing kubernetes secrets is a non standard process. Companies have many possible ways in which they can be managed. Sometimes though, a simple approach of `kubectl` is the most practical to reach out to.

That said, we've found that `kubectl apply -f` or even `kubectl edit` can present challenges. In the case of the former it can be easy to end up with files that were out of sync and unintended changes to secrets can happen. With the latter, encoding erros or manual file modifications can be serious enough to take down an entire application.

But even more, when trying to look at the data available the process can be tedious (`kubectl get secret <secret> | ....  | base64 --decode` or similar bashing).

We are making `kubesecret` to give team members a guided approach to performing CRUD operations on secrets in kubernetes. In the future the capabilities of the tool might be extended to do things such as finding where a secret/secret key is being used. Finally, we are aiming to make the behaviour extendable from the start via the use of plugins.

## Using

**Please note that this tool runs ON TOP of `kubectl`. You need to have `kubectl` installed and running on your OS before using this tool**

### npm

```
npm install -g @bufferapp/kubesecret
```

Now run `kubesecret help` to explore what you can do!

### Download the binary

* Go to the releases, and download the binary for the OS of your choice.
* Place the binary somewhere on your `$PATH`.
* Run it using `kubesecret help` to see what you can do with it.

<details>
<summary>A note on windows support</summary>
<p>

While Windows support is currently not supported, we'll be taking care to try and not introduce patterns that exclude windows. We make no guarantees and you are free to run `node_modules/pkg/lib-es5/bin.js -t node10-win-x64` to get yourself a Windows binary and test things out.

</p>
</details>

## Developing the tool

* Download the repo
* Run `npm install`. The tool is being developed using node `v10.x.x`
* Code away
* To test changes without building the binary run `node scripts/kubesecret.js`
* Install it globally on your machine using `npm link`
