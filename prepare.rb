#!/usr/bin/env ruby

require "eregex"
require "fileutils"

project = File.basename(Dir.getwd)
version = nil
File.open("manifest.json") do |f|
	f.any? do |line|
		if /"version"/.match(line)
			version = /[0-9]+.[0-9]+.[0-9]/.match(line).to_s.gsub(/\./) { "" }
		end
	end
end

prepared_dir = "../#{project}_#{version}"

FileUtils.rm_r("#{prepared_dir}", :verbose => true)
FileUtils.cp_r("./", "#{prepared_dir}", :verbose => true)
FileUtils.rm_r(Dir.glob("#{prepared_dir}/**/*.{psd}"), :verbose => true)
FileUtils.rm(Dir.glob("#{prepared_dir}/**/.DS_Store"), :verbose => true)
FileUtils.rm_r(["#{prepared_dir}/.git", "#{prepared_dir}/promos", "#{prepared_dir}/.gitignore", "#{prepared_dir}/prepare.rb", "#{prepared_dir}/tests"], :verbose => true)

Dir.glob("#{prepared_dir}/**/*.{js,html,css}").each do |file|
	new_name = File.dirname(file) + "/" + File.basename(file, File.extname(file)) + "_" + version + File.extname(file)
	File.rename(file, new_name)
end

match = Regexp.escape("\\.js")
replace = Regexp.escape("_#{version}.js")
system("find -E #{prepared_dir} -type f -iregex '(.*\.html|.*/manifest\.json)' -exec sed -i '' s/#{match}/#{replace}/g {} +")

match = Regexp.escape("\\.html")
replace = Regexp.escape("_#{version}.html")
system("find -E #{prepared_dir} -type f -iregex '(.*\.html|.*/manifest\.json)' -exec sed -i '' s/#{match}/#{replace}/g {} +")

match = Regexp.escape("\\.css")
replace = Regexp.escape("_#{version}.css")
system("find -E #{prepared_dir} -type f -iregex '(.*\.html|.*/manifest\.json)' -exec sed -i '' s/#{match}/#{replace}/g {} +")