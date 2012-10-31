#!/usr/bin/env ruby

require "eregex"
require "fileutils"

version = "200"
prepared_dir = "../Tiles_#{version}"

FileUtils.rm_r("#{prepared_dir}", :verbose => true)
FileUtils.cp_r("./", "#{prepared_dir}", :verbose => true)
FileUtils.rm_r(Dir.glob("#{prepared_dir}/**/*.{psd}"), :verbose => true)
FileUtils.rm_r(["#{prepared_dir}/.git", "#{prepared_dir}/promos", "#{prepared_dir}/.gitignore", "#{prepared_dir}/prepare.rb"], :verbose => true)

Dir.glob("#{prepared_dir}/**/*.{js}").each do |file|
	new_name = File.dirname(file) + "/" + File.basename(file, ".js") + "_" + version + ".js"
	File.rename(file, new_name)
end

# match = Regexp.escape(".js")
# replace = Regexp.escape("_#{version}.js")

# exec("find #{prepared_dir} -type f | cat")