require 'rake'

task :default => :test

desc "Makes sure the code isn't too big"
task :test do
  sh 'zip -r spare-me.zip . -i@manifest.txt'
  size = ::File.size('spare-me.zip')
  puts "zip size: #{size} bytes (used #{percent size}%)"
  fail 'zip file too big!' if size > 13 * 1024
end

def percent size
  max = 13 * 1024
  (size.to_f / max.to_f * 100).to_i
end
