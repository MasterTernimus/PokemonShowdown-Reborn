"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var github_exports = {};
__export(github_exports, {
  GitHub: () => GitHub,
  commands: () => commands,
  destroy: () => destroy,
  gitData: () => gitData,
  pages: () => pages
});
module.exports = __toCommonJS(github_exports);
var import_lib = require("../../lib");
const STAFF_REPOS = Config.staffrepos || [
  "PokemonShowdown-Reborn",
  "PokemonShowdown-Client",
  "Pokemon-Showdown-Dex",
  "pokemon-showdown-loginserver"
];
const COOLDOWN = 10 * 60 * 1e3;
const gitData = JSON.parse((0, import_lib.FS)("config/chat-plugins/github.json").readIfExistsSync() || "{}");
const GitHub = new class {
  constructor() {
    this.hook = null;
    this.updates = /* @__PURE__ */ Object.create(null);
    if (!Config.github)
      return;
    try {
      this.hook = require("githubhook")({
        logger: {
          log: (line) => Monitor.debug(line),
          error: (line) => Monitor.notice(line)
        },
        ...Config.github
      });
    } catch (err) {
      Monitor.crashlog(err, "GitHub hook");
    }
    this.listen();
  }
  listen() {
    if (!this.hook)
      return;
    this.hook.listen();
    this.hook.on("push", (repo, ref, result) => this.handlePush(repo, ref, result));
    this.hook.on("pull_request", (repo, ref, result) => this.handlePull(repo, ref, result));
  }
  getRepoName(repo) {
    switch (repo) {
      case "PokemonShowdown-Reborn":
        return "server";
      case "PokemonShowdown-Client":
        return "client";
      case "Pokemon-Showdown-Dex":
        return "dex";
      default:
        return repo.toLowerCase();
    }
  }
  handlePush(repo, ref, result) {
    const branch = /[^/]+$/.exec(ref)?.[0] || "";
    if (branch !== "master")
      return;
    const messages = {
      staff: [],
      development: []
    };
    for (const commit of result.commits) {
      const { message, url } = commit;
      const [shortMessage] = message.split("\n\n");
      const username = this.getUsername(commit.author.name);
      const repoName = this.getRepoName(repo);
      const id = commit.id.substring(0, 6);
      messages.development.push(
        import_lib.Utils.html`[<span style="color:#FF00FF">${repoName}</span>] <a href="${url}" style="color:#606060">${id}</a> ${shortMessage} <span style="color:#909090">(${username})</span>`
      );
      messages.staff.push(import_lib.Utils.html`[<span style="color:#FF00FF">${repoName}</span>] <a href="${url}">${shortMessage}</a> <span style="color:#909090">(${username})</span>`);
    }
    for (const k in messages) {
      this.report(k, repo, messages[k]);
    }
  }
  handlePull(repo, ref, result) {
    if (this.isRateLimited(result.number))
      return;
    if (this.isGitbanned(result))
      return;
    const url = result.pull_request.html_url;
    const action = this.isValidAction(result.action);
    if (!action)
      return;
    const repoName = this.getRepoName(repo);
    const userName = this.getUsername(result.sender.login);
    const title = result.pull_request.title;
    let buf = import_lib.Utils.html`[<span style="color:#FF00FF">${repoName}</span>] <span style="color:#909090">${userName}</span> `;
    buf += import_lib.Utils.html`${action} <a href="${url}">PR#${result.number}</a>: ${title}`;
    this.report("development", repo, buf);
  }
  report(roomid, repo, messages) {
    if (!STAFF_REPOS.includes(repo) && roomid === "staff")
      return;
    if (Array.isArray(messages))
      messages = messages.join("<br />");
    Rooms.get(roomid)?.add(`|html|<div class="infobox">${messages}</div>`).update();
  }
  isGitbanned(result) {
    if (!gitData.bans)
      return false;
    return gitData.bans[result.sender.login] || gitData.bans[result.pull_request.user.login];
  }
  isRateLimited(prNumber) {
    if (this.updates[prNumber]) {
      if (this.updates[prNumber] + COOLDOWN > Date.now())
        return true;
      this.updates[prNumber] = Date.now();
      return false;
    }
    this.updates[prNumber] = Date.now();
    return false;
  }
  isValidAction(action) {
    if (action === "synchronize")
      return "updated";
    if (action === "review_requested") {
      return "requested a review for";
    } else if (action === "review_request_removed") {
      return "removed a review request for";
    }
    if (["ready_for_review", "labeled", "unlabeled", "converted_to_draft"].includes(action)) {
      return null;
    }
    return action;
  }
  getUsername(name) {
    return gitData.usernames?.[toID(name)] || name;
  }
  save() {
    (0, import_lib.FS)("config/chat-plugins/github.json").writeUpdate(() => JSON.stringify(gitData));
  }
}();
const commands = {
  gh: "github",
  github: {
    ""() {
      return this.parse("/help github");
    },
    ban(target, room, user) {
      room = this.requireRoom("development");
      this.checkCan("mute", null, room);
      const [username, reason] = import_lib.Utils.splitFirst(target, ",").map((u) => u.trim());
      if (!toID(target))
        return this.parse(`/help github`);
      if (!toID(username))
        return this.errorReply("Provide a username.");
      if (room.auth.has(toID(GitHub.getUsername(username)))) {
        return this.errorReply("That user is Dev roomauth. If you need to do this, demote them and try again.");
      }
      if (!gitData.bans)
        gitData.bans = {};
      if (gitData.bans[toID(username)]) {
        return this.errorReply(`${username} is already gitbanned.`);
      }
      gitData.bans[toID(username)] = reason || " ";
      GitHub.save();
      this.privateModAction(`${user.name} banned the GitHub user ${username} from having their GitHub actions reported to this server.`);
      this.modlog("GITHUB BAN", username, reason);
    },
    unban(target, room, user) {
      room = this.requireRoom("development");
      this.checkCan("mute", null, room);
      target = toID(target);
      if (!target)
        return this.parse("/help github");
      if (!gitData.bans?.[target])
        return this.errorReply("That user is not gitbanned.");
      delete gitData.bans[target];
      if (!Object.keys(gitData.bans).length)
        delete gitData.bans;
      GitHub.save();
      this.privateModAction(`${user.name} allowed the GitHub user ${target} to have their GitHub actions reported to this server.`);
      this.modlog("GITHUB UNBAN", target);
    },
    bans() {
      const room = this.requireRoom("development");
      this.checkCan("mute", null, room);
      return this.parse("/j view-github-bans");
    },
    setname: "addusername",
    addusername(target, room, user) {
      room = this.requireRoom("development");
      this.checkCan("mute", null, room);
      const [gitName, username] = import_lib.Utils.splitFirst(target, ",").map((u) => u.trim());
      if (!toID(gitName) || !toID(username))
        return this.parse(`/help github`);
      if (!gitData.usernames)
        gitData.usernames = {};
      gitData.usernames[toID(gitName)] = username;
      GitHub.save();
      this.privateModAction(`${user.name} set ${gitName}'s name on reported GitHub actions to be ${username}.`);
      this.modlog("GITHUB SETNAME", null, `'${gitName}' to '${username}'`);
    },
    clearname: "removeusername",
    removeusername(target, room, user) {
      room = this.requireRoom("development");
      this.checkCan("mute", null, room);
      target = toID(target);
      if (!target)
        return this.parse(`/help github`);
      const name = gitData.usernames?.[target];
      if (!name)
        return this.errorReply(`${target} is not a GitHub username on our list.`);
      delete gitData.usernames?.[target];
      if (!Object.keys(gitData.usernames || {}).length)
        delete gitData.usernames;
      GitHub.save();
      this.privateModAction(`${user.name} removed ${target}'s name from the GitHub username list.`);
      this.modlog("GITHUB CLEARNAME", target, `from the name ${name}`);
    },
    names() {
      return this.parse("/j view-github-names");
    }
  },
  githubhelp: [
    `/github ban [username], [reason] - Bans a GitHub user from having their GitHub actions reported to Dev room. Requires: % @ # &`,
    `/github unban [username] - Unbans a GitHub user from having their GitHub actions reported to Dev room. Requires: % @ # &`,
    `/github bans - Lists all GitHub users that are currently gitbanned. Requires: % @ # &`,
    `/github setname [username], [name] - Sets a GitHub user's name on reported GitHub actions to be [name]. Requires: % @ # &`,
    `/github clearname [username] - Removes a GitHub user's name from the GitHub username list. Requires: % @ # &`,
    `/github names - Lists all GitHub usernames that are currently on our list.`
  ]
};
const pages = {
  github: {
    bans(query, user) {
      const room = Rooms.get("development");
      if (!room)
        return this.errorReply("No Development room found.");
      this.checkCan("mute", null, room);
      if (!gitData.bans)
        return this.errorReply("There are no gitbans at this time.");
      let buf = `<div class="pad"><h2>Current Gitbans:</h2><hr /><ol>`;
      for (const [username, reason] of Object.entries(gitData.bans)) {
        buf += `<li><strong>${username}</strong> - ${reason.trim() || "(No reason found)"}</li>`;
      }
      buf += `</ol>`;
      return buf;
    },
    names() {
      if (!gitData.usernames)
        return this.errorReply("There are no GitHub usernames in the list.");
      let buf = `<div class="pad"><h2>Current GitHub username mappings:</h2><hr /><ol>`;
      for (const [username, name] of Object.entries(gitData.usernames)) {
        buf += `<li><strong>${username}</strong> - ${name}</li>`;
      }
      buf += `</ol>`;
      return buf;
    }
  }
};
function destroy() {
  GitHub.hook?.server.close();
}
//# sourceMappingURL=github.js.map
