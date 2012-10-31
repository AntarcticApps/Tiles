#!/usr/bin/env ruby

require "eregex"
require "fileutils"

project = File.basename(Dir.getwd)
version = "200"
prepared_dir = "../#{project}_#{version}"

FileUtils.rm_r("#{prepared_dir}", :verbose => true)
FileUtils.cp_r("./", "#{prepared_dir}", :verbose => true)
FileUtils.rm_r(Dir.glob("#{prepared_dir}/**/*.{psd}"), :verbose => true)
FileUtils.rm(Dir.glob("#{prepared_dir}/**/.DS_Store"), :verbose => true)
FileUtils.rm_r(["#{prepared_dir}/.git", "#{prepared_dir}/promos", "#{prepared_dir}/.gitignore", "#{prepared_dir}/prepare.rb", "#{prepared_dir}/tests"], :verbose => true)

Dir.glob("#{prepared_dir}/**/*.{js}").each do |file|
	new_name = File.dirname(file) + "/" + File.basename(file, ".js") + "_" + version + ".js"
	File.rename(file, new_name)
end

match = Regexp.escape("\\.js")
replace = Regexp.escape("_#{version}.js")

exec("find -E #{prepared_dir} -type f -iregex '(.*\.html|.*/manifest\.json)' -exec sed -i '' s/#{match}/#{replace}/g {} +")