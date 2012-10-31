#!/usr/bin/env ruby

require "eregex"

# @string1 = ".js"
# @string2 = "_200.js"

# @string1 = Regexp.escape(@string1)
# @string2 = Regexp.escape(@string2)

# exec("find ./ -type f | xargs sed -i 's/#{@string1}/#{@string2}/g'")

Dir.glob("./**/*").each do |file|
	if File.extname(file) == ".js"
		puts file
	end
end