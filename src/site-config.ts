import footer from './data/footer.json'
import navigation from './data/navigation.json'
import site from './data/site.json'
import socialLinks from './data/social.json'

export const siteConfig = {
  author: site.author,
  title: site.title,
  description: site.description,
  image: site.image,
  email: site.email,
  socialLinks,
  header: {
    logo: site.logo,
    navLinks: navigation.navLinks,
  },
  page: {
    blogLinks: navigation.blogLinks,
  },
  footer: {
    navLinks: footer.navLinks,
    license: footer.license,
  },
}

export default siteConfig
