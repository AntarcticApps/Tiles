#!/usr/bin/env ruby

require "eregex"
require "fileutils"

VERSION_DIRECTORY_IDENTIFIER = "TILES_VERSION_ID__"

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

File.rename("#{prepared_dir}/#{VERSION_DIRECTORY_IDENTIFIER}", "#{prepared_dir}/#{version}")

manifest_file_name = "#{prepared_dir}/manifest.json"
manifest = File.read(manifest_file_name)
manifest.gsub!(VERSION_DIRECTORY_IDENTIFIER, version)
File.open(manifest_file_name, "w") { |file|
	file.puts manifest
}

def recursive_string_find_and_replace(dir, types_exp, match, replace)
	system("find -E #{dir} -type f -iregex '#{types_exp}' -exec sed -i '' s/#{match}/#{replace}/g {} +")
end

recursive_string_find_and_replace(prepared_dir, "(.*\.html|.*\.css|.*\.js|.*\.json)", Regexp.escape("TILES_VERSION_ID__"), Regexp.escape("#{version}"))