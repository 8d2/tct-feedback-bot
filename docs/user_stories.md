## User Story A - Feedbacker

**A.1.** As a *feedbacker*, I want to *post feedback contracts within forum posts* so that I can *receive points after providing feedback*.
* To prevent spam and abuse, feedbackers may post a maximum of 1 contract per tower per week.
* A minimum character/message limit check may be enforced to further prevent abuse.

**A.2.** As a *feedbacker*, I want to *obtain roles for achieving certain point milestones* so I can *have an incentive to provide feedback*.
* 15 points = Feedbacker
* 60 points = Veteran Feedbacker
* The bot will automatically award these roles once these point milestones are reached.
* These milestones may be adjusted later.

**A.3.** As a *feedbacker*, I want to *appear on a feedback point leaderboard* so that I can *continue to be incentivized, even after I have achieved the highest point milestone*.


## User Story B - Builder

**B.1.** As a *builder*, I want to *add a forum tag to enable feedback contracts* so that I can *receive feedback only when my tower is ready*.
* This forum tag is not present by default; builders must enable it manually.

**B.2.** As a *builder*, I want to *assign a star rating (0-3) to feedback contracts* so that I can *reward users based on the quality and effort of their feedback*.
* 💣 = Provided minimal to no feedback
* ⭐ = Provided partial feedback, or poor feedback with demonstrable effort
* ⭐⭐ = Provided complete feedback
* ⭐⭐⭐ = Provided thoughtful, thorough, insightful feedback; went the extra mile
* Each star is worth one point.

**B.3.** As a *builder*, I want to *sign off on feedback contracts* so that I can *reward users for providing feedback on my tower*.
* If there's a "sign contract" button, it should be disabled until a star rating has been assigned.
* Once the contract is signed, the builder cannot edit their star rating without the help of a staff member.

**B.4.** As a *builder*, I want to *give builder permissions to my collaborators* so that *they can accept feedback contracts on my behalf*.
* Of course, the forum poster will have builder permissions by default.
* It may be necessary to have separate "lead builder" and "collaborator" roles to centralize role management.


## User Story C - Moderator

**C.1.** As a *moderator*, I want to *re-assign star ratings* so that I can *settle rating disputes and correct user errors*.

**C.2.** As a *moderator*, I want to *block users from creating contracts* so that I can *punish repeat offenders who abuse the automated feedback system*.


## User Story D - Administrator

**D.1.** As an *administrator*, I want to *assign a forum channel (or channels) to be the official "tower feedback" channel* so that *the feedback bot is only used within that channel*.

**D.2.** As an *administrator*, I want to *assign a role to each point milestone* so that *the bot is able to assign these roles automatically*.
