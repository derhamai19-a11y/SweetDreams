export const CATEGORIES = [
  { id: 'smart',     label: 'Smart',        emoji: '🧠', color: '#B19CD9', description: 'Did something difficult' },
  { id: 'brave',     label: 'Brave',        emoji: '🦁', color: '#FFB97A', description: 'Did it even when scared' },
  { id: 'kind',      label: 'Kind',         emoji: '💗', color: '#F0A8B8', description: 'Was a good friend' },
  { id: 'curious',   label: 'Curious',      emoji: '🔍', color: '#8FD9C4', description: 'Tried something new' },
  { id: 'listening', label: 'Listening',    emoji: '👂', color: '#FFD584', description: 'Listened to grown-ups' },
  { id: 'determined',label: 'Determined',   emoji: '💪', color: '#C9598F', description: "Didn't give up" },
  { id: 'gentle',    label: 'Gentle',       emoji: '🌸', color: '#F5C2E0', description: 'Was careful and soft' },
  { id: 'helper',    label: 'Happy Helper', emoji: '🤝', color: '#A8D5BA', description: 'Helped without being asked' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

export const AVATARS = [
  { id: 'bear',     emoji: '🐻', label: 'Bear' },
  { id: 'fox',      emoji: '🦊', label: 'Fox' },
  { id: 'rabbit',   emoji: '🐰', label: 'Rabbit' },
  { id: 'lion',     emoji: '🦁', label: 'Lion' },
  { id: 'owl',      emoji: '🦉', label: 'Owl' },
  { id: 'cat',      emoji: '🐱', label: 'Cat' },
  { id: 'dog',      emoji: '🐶', label: 'Dog' },
  { id: 'penguin',  emoji: '🐧', label: 'Penguin' },
  { id: 'panda',    emoji: '🐼', label: 'Panda' },
  { id: 'koala',    emoji: '🐨', label: 'Koala' },
  { id: 'monkey',   emoji: '🐵', label: 'Monkey' },
  { id: 'unicorn',  emoji: '🦄', label: 'Unicorn' },
]

export const AVATAR_MAP = Object.fromEntries(AVATARS.map(a => [a.id, a]))

export const FEELINGS = [
  { id: 'happy',  emoji: '😄', label: 'Happy',  color: '#FFD584' },
  { id: 'sad',    emoji: '😢', label: 'Sad',    color: '#8FB8E8' },
  { id: 'angry',  emoji: '😠', label: 'Angry',  color: '#F08070' },
  { id: 'scared', emoji: '😨', label: 'Scared', color: '#B19CD9' },
]

export const PROUD_PRESETS = [
  { emoji: '🧩', label: 'I tried something hard' },
  { emoji: '🤝', label: 'I shared with someone' },
  { emoji: '🦁', label: 'I was brave' },
  { emoji: '🍽️', label: 'I tried new food' },
  { emoji: '🎨', label: 'I made something' },
  { emoji: '🤗', label: 'I was kind' },
  { emoji: '💪', label: "I didn't give up" },
  { emoji: '🧹', label: 'I helped tidy up' },
]

export const DEFAULT_REWARDS = [
  { id: '1', name: 'Ice Cream Treat', emoji: '🍦', threshold: 5,  unlocked: false },
  { id: '2', name: 'Trip to the Park', emoji: '🌳', threshold: 12, unlocked: false },
  { id: '3', name: 'New Toy', emoji: '🎁', threshold: 25, unlocked: false },
]

export const FRIEND_AVATAR = { id: 'friend', emoji: '🧒', label: 'A Friend', isGeneric: true }
