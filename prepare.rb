#!/usr/bin/env ruby

require "fileutils"

version = "200"
prepared_dir = "../Tiles_#{version}"

FileUtils.cp_r("./", "#{prepared_dir}", :verbose => true, :remove_destination => true)

# Dir.glob("#{prepared_dir}/**/*.{js}").each do |file|
# 	new_name = File.basename(file, ".js") + "_" + version + ".js"
# 	File.rename(file, new_name)
# 	puts new_name
# end