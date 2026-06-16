import { Sermon, ChurchEvent, Ministry, BlogPost, UserProfile } from './types';

export const CHURCH_COORDINATES = {
  lat: -26.32604,
  lng: 31.1411, // Mbabane, Eswatini Coordinates
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  ministries: [],
  avatar: "",
  joinedDate: new Date().toISOString().split('T')[0],
  isPastor: false,
};

export const PASTOR_INFO = {
  name: "",
  title: "",
  photo: "",
  welcomeText: "",
  bio: ""
};

export const TIMELINE_MILESTONES: any[] = [];

export const CORE_VALUES: any[] = [];

export const CHURCH_LEADERS: any[] = [];

export const INITIAL_SERMONS: Sermon[] = [];

export const INITIAL_EVENTS: ChurchEvent[] = [];

export const INITIAL_MINISTRIES: Ministry[] = [];

export const INITIAL_BLOG_POSTS: BlogPost[] = [];

export const DAILY_BIBLE_VERSES: any[] = [];

export const TESTIMONIALS: any[] = [];
