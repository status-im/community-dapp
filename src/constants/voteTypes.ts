type Vote = {
  [type: string]: {
    question: string
    for: {
      icon: string
      text: string
      verb: string
    }
    against: {
      icon: string
      text: string
      verb: string
    }
  }
}

export const voteTypes: Vote = {
  Add: {
    question: 'Add to Communities directory?',
    for: {
      icon: '👍',
      text: 'Add',
      verb: 'to add',
    },
    against: {
      icon: '👎',
      text: "Don't add",
      verb: 'not to add',
    },
  },

  Remove: {
    question: 'Remove from Communities directory?',
    for: {
      icon: '🗑',
      text: 'Remove',
      verb: 'to remove',
    },
    against: {
      icon: '📌',
      text: 'Keep',
      verb: 'to keep',
    },
  },
}
