# Portfolio

Run the site locally with Node.js and npm installed:

```sh
npm run dev
```

Open http://127.0.0.1:8000. No dependency installation is needed.
The development server uses only built-in Node.js modules. To use another port,
run `PORT=8001 npm run dev`.

UI labels, metadata templates, and error messages live in `strings.js`.

The page loads the profile and project list from `projects.json`. Edit that file
and refresh the page to see changes. Serve the site over HTTP; opening
`index.html` directly prevents the browser from fetching the JSON.

For deployment, upload `index.html`, `styles.css`, `script.js`, `strings.js`, `projects.json`,
and `assets/` to any static web host.

The first three featured projects include illustrative interactive demos. Their
sample content lives in `strings.js`; profile and project descriptions live in
`projects.json`. The remaining projects expand to show descriptions.

8 Queens embeds the deployed app from `projects.json` → `embed` when its entry
is expanded. Its source and live links are configured in the same entry. The
embed requires internet access; it runs the original app without copying its code.

Math Kingdom uses its real live app in the featured section. The app loads
automatically; the live and source links remain available beside it.

Just Dancing embeds the original webcam game and delegates camera access to
that frame. Visitors must approve camera access in their browser. Its live app
link is available if embedded camera access is unsupported.
