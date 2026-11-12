# Disconnect Dojo

You want to cancel. Darren wants his bonus.

You play Alex Morgan. Your $89 internet plan renews tomorrow, and you want to leave Forever Cable. On the other end is Darren Pike, a former technician who now works in retention. Practice leaving the call knowing when service ends, what you owe, and what happens to the router.

## Start in a Claude Project

1. Create a Claude Project called **Disconnect Dojo**.
2. Add the eleven simulation files to the project knowledge: `identity.md`, `rules.md`, `examples.md`, `reference/account.md`, `reference/company.md`, and the six numbered Markdown files in `reference/retention-department/`. You can upload them individually. The README and optional interface files stay on your computer.
3. Put this paragraph in the project instructions:

> Run Disconnect Dojo. Play Darren Pike from identity.md. Apply rules.md from the first customer message, use the account, company and six department files for all terms and procedures, and use examples.md for calibration. Begin directly in character. Only the exact standalone end command in rules.md opens the debrief. In Normal Mode, respond to AI challenges in Darren's voice using what the caller just said. Address the specific wording, worry or unanswered question first. If pressed, respond to the new point or finish the account business plainly. Do not use a stock AI joke, claim to be human or treat a question as authorization.

4. Open a new chat in the Project and type **I'd like to cancel my internet service.** This starts the ordinary Darren rehearsal. Give your own reason, ask follow-up questions, or change your mind. You can also start with **Start the call.**

Authentication is already complete. Your current month is paid and you lease one router. All account actions are fictional. No credentials or real account details are needed.

To receive feedback, type this exact line as your entire message, including the em dash:

`END CALL — DEBRIEF`

A goodbye closes the conversation in character. Quoting the phrase inside a question leaves the call open. Start a new Project chat to rehearse again.

## Optional ways to play

Normal Mode is the competition rehearsal. The five optional voices change how Darren speaks. His identity, account authority and goal stay the same. To choose a specialized voice in a Claude Project, start a fresh chat and send exactly one of these lines as the entire first message:

- `Deadpool Mode`
- `Don Rickles Mode`
- `Larry David Mode`
- `Lewis Black Mode`
- `Steven Wright Mode`

Wait for Darren to answer, then give your own reason for calling in your next message. The selection lasts for the whole call. To switch voices, open a fresh Project chat. For Normal Mode, use either opening in step 4 above.

### Start with your existing Claude login

Open **reference/mode-picker.html** from the extracted folder or use **reference/Start simulator.cmd**. Choose a voice and select **Start call in Claude Desktop**. In the new Cowork session, check that **artifact-runtime.txt** is attached and send the prepared message. Type your questions and decisions directly in that conversation. Send **END CALL — DEBRIEF** for feedback.

For a dedicated interactive UI, expand **Create a reusable simulator window**, select **Create live simulator in Claude**, and send the setup request with its attached runtime. Open the resulting artifact, allow it to use Claude when prompted, choose a mode, and speak to Darren in the artifact. Reopen it from Claude for later calls. Desktop launch links require Claude Desktop with Cowork access. The artifact also requires artifact creation and access to Claude in your account.

To keep a separate Desktop draft open, choose **Create in a fresh Claude web window** from the local picker. Sign in to Claude in that browser, attach **reference/artifact-runtime.txt** using the file picker, and send the prepared build request. The browser link opens a new tab. The Desktop draft stays in its original window.

### Optional manual transcript

Choose **Start manual transcript** to record a Project chat in the local page.

Copy the displayed message and send it in a fresh **Disconnect Dojo** Claude Project chat. Paste Darren’s response into the simulator and select **Add reply to transcript**. Compose your next turn under **Your reply** and repeat in the same chat. **End call & debrief** prepares the end command. Paste Claude’s feedback and select **Show debrief** to see it below the conversation. The local transcript lasts until you reload or start another rehearsal.

For a secret voice the mode name opens the call by itself. The simulator keeps your custom opening ready as your next turn. The Project setup is above.

### Optional browser call with an API key

Extract the submission. On Windows, open **Start API simulator.cmd** inside the **reference** folder. It requires Node.js 20 or later and an Anthropic API key with credit and model access. The launcher prompts privately for the key if needed, keeps it in the local server process, and opens the simulator in your browser. Keep the terminal window open during the call. On macOS or Linux, set `ANTHROPIC_API_KEY` in your terminal environment, run `node reference/serve.mjs` from the extracted simulator folder, and open the printed local address. The default model is `claude-opus-5-5`. Set `ANTHROPIC_MODEL` to use another Messages API model available to your account.

Choose a voice and select **Start API call**. Type your own reason, question, or instruction in **Your reply** and select **Send reply**. Darren receives the simulator rules and the conversation so far with each turn through the Anthropic API, which incurs API usage charges. The transcript lives in the open tab. Select **End call & debrief** for feedback on your actual conversation. You can also use the Claude Project route above with your existing Claude login.
