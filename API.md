## Community details

Community details is taken from status wallet API

```ts
getCommunityDetails(publicKey: String) // returns object describing community of address communityAddress

type CommunityDetail: {
    publicKey: string // Address of a community
    ens: string | undefined // ens of a community
    name: string // name of a community
    link: string // link to visit a community
    icon: string // url to a icon of a community
    tags: [string] // list of strings that contain tag names
    description: string // short description about community
    numberOfMembers: number // amount of members in community
}
```

# Subgraph API

## List of communities under vote

```ts
//Enum describing sorting types
enum VotingSortingEnum {
    EndingSoonest= 0
    EndingLatest= 1
    MostVotes= 2
    LeastVotes= 3
    AtoZ= 4
    ZtoA= 5
}

// returns a list of public keys of communities under vote
// amount of communities in list is described by NumberPerPage
// pageNumber describes which page to return
// sorted by describes sorting in list
// filter keyword is a string that contains a text to filter a communities list
// voteType:
// voteType can be 'Add' , 'Remove' , '' when voteType is 'Add' or 'Remove' it will only return
// communities that are under vote of type 'Add' or 'Remove' when voteType is '' it will return all 
// communities under vote
getCommunitiesUnderVote(numberPerPage: Number, 
                        pageNumber:Number, 
                        sortedBy: VotingSortingEnum, 
                        filterKeyword: String,
                        voteType: String) 
{
    page: Number // page number
    communities: [ string ] // list of public keys of communities under vote
}

```

## List of communities in directory

```ts
//Enum describing sorting types
enum DirectorySortingEnum {
    IncludedRecently= 0
    IncludedLongAgo= 1
    MostVotes= 2
    LeastVotes= 3
    AtoZ= 4
    ZtoA= 5
}

// returns a list of public keys of communities under vote
// amount of communities in list is described by NumberPerPage
// pageNumber describes which page to return
// sorted by describes sorting in list
// filter keyword is a string that contains a text to filter a communities list
getCommunitiesInDirectory(numberPerPage: Number, 
                          pageNumber:Number, 
                          sortedBy: DirectorySortingEnum, 
                          filterKeyword: String) 
{
    page: Number // page number
    communities: [ string ] // list of public keys of communities under vote
}

```