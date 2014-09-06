require 'rake'
require 'rake/clean'
require 'rubygems'
gem 'autoprefixer-rails'
require 'autoprefixer-rails'
require 'base64'

CLEAN.include 'css/mobile.css'
CLEAN.include 'spare-me.zip'

task :default => :test

desc "Makes sure the code isn't too big"
task :test => 'css/mobile.css' do
  sh 'zip -r spare-me.zip . -i@manifest.txt'
  size = ::File.size('spare-me.zip')
  puts "zip size: #{size} bytes (used #{percent size}%)"
  fail 'zip file too big!' if size > 13 * 1024
end

desc 'Runs a simple web server for testing'
task :demo, :port do |t, args|
  port = args[:port] || '8080'
  src = []
  src << "a = { :Port => #{port}, :DocumentRoot => Dir.pwd }"
  src << 's = WEBrick::HTTPServer.new(a)'
  src << 'trap("INT") { s.shutdown }'
  src << 's.start'
  src = "'" + src.join('; ') + "'"
  ruby "-rwebrick -e #{src}"
end

desc 'Publish to the website'
task :publish do
  sh 'rsync -avz --delete --files-from=manifest.txt ./ frankmitchell.org:/home/public/spare-me/'
end

desc 'Run Autoprefixer on the CSS'
task :autoprefix => 'css/mobile.css'

file 'css/mobile.css' => 'css/screen.css' do
  css = ::File.read('css/screen.css')
  ::File.open('css/mobile.css', 'w') do |io|
    io << AutoprefixerRails.process(css)
  end
end

desc 'Run UglifyJS on all the JavaScript files'
task :minify => FileList['js/*.js'].map { |f| f.ext 'min.js' }

FileList['js/*.js'].each do |src|
  dst = src.ext 'min.js'
  file dst => src do
    sh "../node_modules/uglify-js/bin/uglifyjs #{src} > #{dst}"
  end
end

desc 'Base64 encode images for URL embedding'
task :base64 do
  html = ::File.read('index.html')
  ::Dir['img/*.png'].each do |file|
    data = ::File.read(file)
    data = ::Base64.strict_encode64(data)
    data = "src=\"data:image/png;base64,#{data}\""
    html = html.gsub("src=\"#{file}\"", data)
  end
  ::File.open('index.html', 'w') { |io| io << html }
end

def percent size
  max = 13 * 1024
  (size.to_f / max.to_f * 100).to_i
end
