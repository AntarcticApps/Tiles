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

def recursive_string_find_and_replace(dir, types_exp, match, replace)
	system("find -E #{dir} -type f -iregex '#{types_exp}' -exec sed -i '' s/#{match}/#{replace}/g {} +")
end

types_to_replace = %w(js html css png)
types_to_replace.each do |type|
	recursive_string_find_and_replace(prepared_dir, "(.*\.html|.*/manifest\.json)", Regexp.escape("\\.#{type}"), Regexp.escape("_#{version}.#{type}"))
end