type Vote = {
  [type: string]: {
    question: string
    for: {
      icon: string
      text: string
      verb: string
      noun: string
    }
    against: {
      icon: string
      text: string
      verb: string
      noun: string
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
      noun: '',
    },
    against: {
      icon: '👎',
      text: "Don't add",
      verb: 'not to add',
      noun: '',
    },
  },

  Remove: {
    question: 'Remove from Communities directory?',
    for: {
      icon: '🗑',
      text: 'Remove',
      verb: 'to remove',
      noun: 'removal',
    },
    against: {
      icon: '📌',
      text: 'Keep',
      verb: 'to keep',
      noun: 'inclusion',
    },
  },
}
