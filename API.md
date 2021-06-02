## Community details

```ts
getCommunityDetails(publicKey: String) // returns object describing community of address communityAddress

type CommunityDetail: {
    publicKey: String // Address of a community
    ens: String // ens of a community
    name: String // name of a community
    link: String // link to visit a community
    icon: String // url to a icon of a community
    tags: [String] // list of strings that contain tag names
    description: String // short description about community
    numberOfMembers: Number // amount of members in community
    validForAddition: Boolean // boolean of wheather community can be added to directory
    votingHistory: [ // list of objects describing previous votes
        {
            date: Date // date of vote
            type: 'Remove' | 'Add' // string with type of vote
            result: 'Passed' | 'Failed' // string with vote result
        }
    ]
    currentVoting: { // object describing current voting if community isnt under vote returns undefined
        timeLeft: Number // number of seconds left in vote if vote is waiting for finalization returns 0
        type: 'Remove' | 'Add'
        voteFor: BigNumber // number of snt for a vote
        voteAgainst: BigNumber // number of snt against a vote
    } | undefined
}
```

## List of communities under vote

```ts
//Enum describing sorting types
SortingEnum enum {
    EndingSoonest: 0
    EndingLatest: 1
    MostVotes: 2
    LeastVotes: 3
    AtoZ: 4
    ZtoA: 5
}

// returns a object describing Communities under vote
// amount of communities in list is described by NumberPerPage
// pageNumber describes which page to return
// sorted by describes sorting in list
getCommunitiesUnderVote(numberPerPage: Number, pageNumber:Number, sortedBy: SortingEnum) 

{
    page: Number // page number
    communities: [ CommunityDetail ] // list of communities under vote
}

```