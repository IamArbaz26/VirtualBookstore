"use client"

import { BookOpen, Users, Heart, Award, Target, Eye } from "lucide-react"

const teamMembers = [
  {
    name: "Muhammad Faisal Raza",
    image: "/images/faisal.jpg",
  },
  {
    name: "Muhammad Arbaz",
    image: "/images/arbaz.jpg",
  },
]

const stats = [
  { icon: BookOpen, label: "Books Available", value: "10,000+" },
  { icon: Users, label: "Active Readers", value: "50,000+" },
  { icon: Heart, label: "Authors Supported", value: "2,500+" },
  { icon: Award, label: "Years of Service", value: "5+" },
]

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-teal-600">Bookish</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to preserve, promote, and celebrate Pakistani literature while building a vibrant
              community of readers and writers.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-teal-600">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-teal-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To create a comprehensive digital platform that makes Pakistani literature accessible to readers
                worldwide while providing authors with the tools and community they need to share their stories. We
                believe in the power of literature to bridge cultures, preserve heritage, and inspire future
                generations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-blue-600">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become the world's leading platform for Pakistani literature, fostering a global community where
                stories transcend borders. We envision a future where every Pakistani author has a voice and every
                reader can discover the rich tapestry of our literary heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Since our launch, we've been proud to support the Pakistani literary community and connect readers with
              amazing stories.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-teal-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                Bookish was born from a simple observation: Pakistani literature, with its rich history and diverse
                voices, deserved a dedicated platform that could reach readers both locally and globally. Founded in
                2019 by a group of literature enthusiasts and technology experts, we set out to bridge the gap between
                traditional publishing and the digital age.
              </p>
              <p className="mb-6">
                What started as a small collection of digitized classics has grown into a comprehensive platform
                featuring works from established authors like Saadat Hasan Manto and Qurratulain Hyder, alongside
                emerging voices who are shaping the future of Pakistani literature.
              </p>
              <p className="mb-6">
                Our platform isn't just about books—it's about community. We've created spaces for readers to discuss
                their favorite works, for authors to connect with their audience, and for literary culture to flourish
                in the digital realm.
              </p>
              <p>
                Today, Bookish serves thousands of readers and hundreds of authors, but our mission remains the same: to
                celebrate and preserve the literary heritage of Pakistan while fostering new voices for generations to
                come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our diverse team brings together expertise in literature, technology, and community building to create the
              best possible experience for our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-32 h-32 object-cover object-top rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{member.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">These core values guide everything we do at Bookish.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Literary Excellence</h3>
              <p className="text-gray-600">
                We curate and promote high-quality literature that represents the best of Pakistani storytelling and
                cultural expression.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600">
                Our readers and authors are at the heart of everything we do. We build features and make decisions based
                on community needs.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cultural Preservation</h3>
              <p className="text-gray-600">
                We're committed to preserving and promoting Pakistani literary heritage for current and future
                generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Mission</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Whether you're a reader, writer, or literature enthusiast, there's a place for you in the Bookish community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Explore Books
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
              Join Community
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
