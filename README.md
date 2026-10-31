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

Featured projects use real app embeds, actual screenshots, or a link to the working POC.
UI copy lives in `strings.js`; profile and project descriptions live in
`projects.json`. The remaining projects expand to show descriptions.

8 Queens embeds the deployed app from `projects.json` → `embed` when its entry
is expanded. Its source and live links are configured in the same entry. The
embed requires internet access; it runs the original app without copying its code.

Math Kingdom uses its real live app in the featured section. The app loads
automatically; the live and source links remain available beside it.

Just Dancing embeds the original webcam game and delegates camera access to
that frame. Visitors must approve camera access in their browser. Its live app
link is available if embedded camera access is unsupported.

CFP Manager is a local-only, single-user internal operations tool for GetOnStage.
Its featured preview uses the actual screenshots in `assets/screenshots/cfp-manager/`.
The gallery order and captions are configured in `projects.json`. Use Previous/Next or scroll horizontally through
the gallery. Images are not links.
