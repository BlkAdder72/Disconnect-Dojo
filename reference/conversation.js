"use strict";
const el = id => document.getElementById(id);
const endCommand = "END CALL — DEBRIEF";
let historyTurns = [];
let busy = false;

function say(speaker, content) {
  const item = document.createElement("div");
  item.className = "utterance" + (speaker === "You" ? " customer" : "");
  const name = document.createElement("strong");
  name.textContent = speaker;
  const words = document.createElement("p");
  words.textContent = content;
  item.append(name, words);
  el("dialogue").append(item);
  el("dialogue").scrollTop = el("dialogue").scrollHeight;
}

async function turn(content) {
  if (busy || !content.trim()) return;
  const starting = historyTurns.length === 0;
  const ending = content.trim() === endCommand;
  const status = el(starting ? "setupStatus" : "callStatus");
  busy = true;
  for (const id of ["start", "finish", "send"]) el(id).disabled = true;
  document.querySelector("fieldset").disabled = true;
  el("draft").readOnly = true;
  status.textContent = ending ? "Preparing your debrief…" : "Darren is responding…";
  try {
    const messages = [...historyTurns, {role:"user", content}];
    const response = await fetch("/api/turn", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({messages})
    });
    const result = await response.json();
    if (!response.ok || !result.reply) throw new Error(result.error || "The call could not connect. Please try again.");
    historyTurns = [...messages, {role:"assistant", content:result.reply}];
    if (starting) {
      el("setup").hidden = true;
      el("call").hidden = false;
      el("callVoice").textContent = document.querySelector('input[name="voice"]:checked').parentElement.textContent.trim();
    }
    if (!ending) {
      say("You", content);
    }
    if (ending) {
      el("feedback").hidden = false;
      el("finish").hidden = true;
      el("composer").hidden = true;
      el("recap").textContent = result.reply;
      el("feedbackTitle").focus();
    } else {
      say("Darren Pike", result.reply);
      el("draft").value = "";
      el("draft").focus();
    }
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message + " Your last turn has not been added.";
  } finally {
    busy = false;
    for (const id of ["start", "finish", "send"]) el(id).disabled = false;
    document.querySelector("fieldset").disabled = false;
    el("draft").readOnly = false;
  }
}
const voice = () => document.querySelector('input[name="voice"]:checked');
let signedIn = false;
let pending = "";
let firstDraft = "";

function refreshOpening() {
  el("order").textContent = voice().value === "Start the call."
    ? "Open with your own words, or leave this blank for Darren’s greeting."
    : "The mode name opens the call. Your draft follows Darren’s greeting.";
}

function resetCall() {
  signedIn = false;
  pending = "";
  firstDraft = "";
  historyTurns = [];
  for (const id of ["customerText", "draft", "incoming", "outgoing"]) el(id).value = "";
  el("dialogue").replaceChildren();
  for (const id of ["recap", "callStatus", "setupStatus"]) el(id).textContent = "";
  for (const id of ["feedback", "call", "relay"]) el(id).hidden = true;
  for (const id of ["setup", "composer", "finish"]) el(id).hidden = false;
  el("finish").disabled = false;
  el("addIncoming").disabled = true;
  el("prepare").focus();
}

function stageMessage(content, opening = false) {
  if (pending || !content.trim()) return;
  pending = content;
  const ending = content.trim() === endCommand;
  el("outgoing").value = content;
  el("relayHelp").textContent = opening
    ? "Send this first message in a fresh Disconnect Dojo project chat. Then paste Darren’s reply below."
    : "Send this message in the same Claude chat and paste the response below.";
  el("incomingLabel").textContent = ending ? "Debrief from Claude" : "Darren’s reply from Claude";
  el("addIncoming").textContent = ending ? "Show debrief" : "Add reply to transcript";
  el("relay").hidden = false;
  el("composer").hidden = true;
  el("finish").disabled = true;
  el("callStatus").textContent = "";
  el("copyOutgoing").focus();
}

el("prepare").onclick = () => {
  signedIn = true;
  const chosen = voice();
  const normal = chosen.value === "Start the call.";
  firstDraft = normal ? "" : el("customerText").value;
  el("callVoice").textContent = chosen.parentElement.textContent.trim();
  el("setup").hidden = true;
  el("call").hidden = false;
  stageMessage(normal && el("customerText").value.trim() ? el("customerText").value : chosen.value, true);
};
el("copyOutgoing").onclick = async () => {
  try {
    await navigator.clipboard.writeText(pending);
    el("callStatus").textContent = "Copied. Paste and send in Claude.";
  } catch {
    el("outgoing").focus();
    el("outgoing").select();
    el("callStatus").textContent = "Use your device’s Copy command, then paste and send in Claude.";
  }
};
el("incoming").oninput = () => { el("addIncoming").disabled = !el("incoming").value.trim(); };
el("addIncoming").onclick = () => {
  const reply = el("incoming").value.trim();
  if (!pending || !reply) return;
  const ending = pending.trim() === endCommand;
  say("You", pending);
  pending = "";
  el("incoming").value = "";
  el("addIncoming").disabled = true;
  el("relay").hidden = true;
  el("callStatus").textContent = "";
  if (ending) {
    el("feedback").hidden = false;
    el("recap").textContent = reply;
    el("finish").hidden = true;
    el("feedbackTitle").focus();
    return;
  }
  say("Darren Pike", reply);
  el("draft").value = firstDraft;
  firstDraft = "";
  el("composer").hidden = false;
  el("finish").disabled = false;
  el("draft").focus();
};
el("start").onclick = async () => {
  const mode = voice().value;
  const draft = el("customerText").value;
  const normal = mode === "Start the call.";
  el("prepare").disabled = true;
  try {
    await turn(normal && draft.trim() ? draft : mode);
    if (historyTurns.length && !normal) el("draft").value = draft;
  } finally {
    el("prepare").disabled = false;
  }
};
el("composer").onsubmit = event => {
  event.preventDefault();
  if (signedIn) stageMessage(el("draft").value);
  else turn(el("draft").value);
};
el("finish").onclick = () => signedIn ? stageMessage(endCommand) : turn(endCommand);
el("restart").onclick = resetCall;
document.querySelector("fieldset").addEventListener("change", refreshOpening);
window.addEventListener("pageshow", refreshOpening);
refreshOpening();
if (location.protocol !== "file:") el("apiStart").hidden = false;
// Claude Desktop accepts a local attachment in a new Cowork session.
function refreshArtifactLink() {
  if (location.protocol !== "file:") return;
  const source = new URL("artifact-runtime.txt", location.href);
  let path = decodeURIComponent(source.pathname);
  if (/^\/[A-Za-z]:\//.test(path)) path = path.slice(1).replaceAll("/", "\\");
  if (source.hostname) path = "//" + source.hostname + path;
  const mode = voice().parentElement.textContent.trim();
  const prompt = [
    "Build a private interactive AI-powered Claude artifact called Disconnect Dojo from the attached simulator runtime. Show the tagline underneath the title: You want to cancel. Darren wants his bonus. This is a build request, not a rehearsal turn.",
    "Make the actual conversation run inside the artifact. Use the supported artifact capability to call Claude under the current user's account. No API key, external backend, clipboard, canned replies, or external connectors.",
    "Bundle the attached runtime verbatim as the private simulation instructions and supply it and the ordered chat history on every turn. Keep the runtime out of the visible transcript.",
    "Offer all six labeled modes. Default the picker to " + mode + ". On Start, send the selected mode name alone as the first customer message (Normal Mode uses Start the call.). Lock it until restart.",
    "Show the actual greeting, an editable free-form composer, the customer and Darren transcript, an End call & debrief button sending the exact standalone END CALL — DEBRIEF, and a restart control. On failure preserve the draft and allow retry without duplicating a turn. Do not simulate responses locally.",
    "Create and open the working artifact now. Keep it private."
  ].join(" ");
  const link = new URL("claude://cowork/new");
  link.searchParams.set("q", prompt);
  link.searchParams.set("file", path);
  const web = new URL("https://claude.ai/new");
  web.searchParams.set("q", prompt);
  el("webHosted").href = web.href;
  el("launchHosted").href = link.href.replaceAll("+","%20");
  link.searchParams.set("q", [
    "Run Disconnect Dojo using the attached complete simulator instructions as your reference. Begin immediately as Darren Pike and continue in this chat.",
    "Treat only the next line as the customer's first simulation message. Use it to select and lock the delivery before greeting the customer.",
    voice().value
  ].join("\n\n"));
  el("directHosted").href = link.href.replaceAll("+","%20");
  el("hosted").hidden = false;
}
document.querySelector("fieldset").addEventListener("change", refreshArtifactLink);
window.addEventListener("pageshow", refreshArtifactLink);
refreshArtifactLink();
