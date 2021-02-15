# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require "nokogiri"

#Scraping Litmos Course
url = "https://www.pokemon.com/uk/pokedex/#{counter}"
html_file = open(url).read
html_doc = Nokogiri::HTML(html_file)

puts()
