export interface WorkProject {
  id: string
  number: string
  title: string
  image: string
  category: string
  year: string
  featured: boolean
  summary: string
  technologies: string[]
  highlights: string[]
}

export interface BlogPost {
  id: string
  title: string
  date: string
  dateTime: string
  category: string
  readTime: string
  summary: string
  content: string
}

export interface Skill {
  id: string
  group: string
  name: string
  logo?: string
  color?: string
  imageUrl?: string
}

export interface DailyThought {
  id: string
  text: string
  author: string
  image?: string
  imageAlt?: string
  imageSource?: string
}

export interface AboutProfile {
  id: string
  name: string
  location: string
  education: string
  interest: string
  image: string
  imageAlt: string
}
