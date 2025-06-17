# Bot Commands
This list shows all commands for the TCT Feedback Bot. The checkbox next to each command indicates whether the command has been implemented or not.
Furthermore, user stories that may apply to a command will be listed below their entry. More commands may be added in the future.

## Utility Commands
- [x] `/ping` - Check if the bot is running.
- [x] `/getinfo <user>` - Get information about a user's progress with the feedback bot, including their total points and earned feedbacker roles.
  > **A.2.** As a *feedbacker*, I want to *obtain roles for achieving certain point milestones* so I can *have an incentive to provide feedback*.
- [x] `/leaderboard <hidden>` - Show the feedback points leaderboard for all users in the server. If `hidden` is true, the leaderboard will only show to you, hiding your leaderboard placement to others.
  > **A.3.** As a *feedbacker*, I want to *appear on a feedback point leaderboard* so that I can *continue to be incentivized, even after I have achieved the highest point milestone*.

## Contract Commands
- [x] `/contract getinfo` - Gets information about the feedback thread, including builders and whether feedback can currently be given.
- [x] `/contract create` - Creates a contract in a feedback thread after you have given feedback, which can be accepted by builders of the towers to earn feedback points.
  > **A.1.** As a *feedbacker*, I want to *post feedback contracts within forum posts* so that I can *receive points after providing feedback*.
  > 
  > **B.2.** As a *builder*, I want to *assign a star rating (0-3) to feedback contracts* so that I can *reward users based on the quality and effort of their feedback*.
  > 
  > **B.3.** As a *builder*, I want to *sign off on feedback contracts* so that I can *reward users for providing feedback on my tower*.
- [x] `/contract allowpings <ping>` - Determines whether you will be pinged for contract related actions. This includes when a contract is posted in a thread you are a builder for, or a contract you posted is accepted.
- [x] `/contract addbuilder <user>` - Adds another user as a collaborator for your feedback thread. They will be allowed to accept feedback contracts on your behalf.
  > **B.4.** As a *builder*, I want to *give builder permissions to my collaborators* so that *they can accept feedback contracts on my behalf*.
- [x] `/contract removebuilder <user>` - Removes a collaborator from your feedback thread.

## Moderator Commands
- [x] `/mod setpoints <user>` - Sets how many feedback points a user has.
  > **C.1.** As a *moderator*, I want to *re-assign star ratings* so that I can *settle rating disputes and correct user errors*.
- [x] `/mod updateroles <user>` - Automatically updates the feedbacker roles a user has based on their points and role requirements.
- [x] `/mod block <user>` - Blocks a user from creating feedback contracts.
  > **C.2.** As a *moderator*, I want to *block users from creating contracts* so that I can *punish repeat offenders who abuse the automated feedback system*.
- [x] `/mod unblock <user>` - Unblocks a user, allowing them to create feedback contracts again.
- [x] `/mod displaybotinfo <channel>` - Creates a messages showing usage info for the bot, including earning and giving feedback points and general rules.

## Admin Commands
- [x] `/admin addchannel <channel>` - Adds this channel as a feedback forum channel where users can create contracts.
  > **D.1.** As an *administrator*, I want to *assign a forum channel (or channels) to be the official "tower feedback" channel* so that *the feedback bot is only used within that channel*.
- [x] `/admin removechannel <channel>` - Removes this feedback channel from allowing contracts.
- [x] `/admin removeallchannels` - Removes all current feedback channels from allowing contracts.
- [x] `/admin addforumtag <id>` - Adds a feedback tag as one that allows builders to make their thread open for feedback. If none of the added tags are present, contracts cannot be made in the thread. Only 1 tag is required.
  > **B.1.** As a *builder*, I want to *add a forum tag to enable feedback contracts* so that I can *receive feedback only when my tower is ready*.
- [x] `/admin removeforumtag <id>` -  Removes a feedback tag with the id.
- [x] `/admin removeallforumtags` -  Removes all feedback tags.
- [x] `/admin setrequirement <roletype> <requirement> <updateallroles>` - Sets the requirement for reaching a certain role type, which will automatically be assigned when users earn that many feedback points.
If `updateallroles` is true, all members will have their roles updated based on this new requirement.
  > **D.2.** As an *administrator*, I want to *assign a role to each point milestone* so that *the bot is able to assign these roles automatically*.
- [x] `/admin setrole <roletype> <role>` - Sets the role to automatically assign when a user reaches the requirement of the role type.
- [x] `/admin settings` - Shows all the current settings of the bot, including the set feedback forum channel, tag, and all role requirements.
- [x] `/admin setcontractcooldown <time>` - Sets how long a user must wait before posting another contract in the same feedback thread.
- [x] `/admin setstaffprotection <level>` - Sets the protection level of mod commands ran on other moderators and admins.
