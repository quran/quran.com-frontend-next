# This ruby script will generate font-faces for both v1, and v2 QCF font.
#
# run `ruby scripts/gen_qcf_font_faces.rb` to generate the css
#

File.open("src/styles/qcf-v1-fonts.css", "wb") do |file|
  # Generate v1 font face for each page
  1.upto(604) do |page|
    file.puts("
     @font-face {
      font-family: 'p#{page}-v1';
      src: local(QCF_P#{page.to_s.rjust(3, '0')}),
      url('/fonts/v1/woff2/p#{page}.woff2') format('woff2'),
      url('/fonts/v1/woff/p#{page}.woff') format('woff'),
      url('/fonts/v1/ttf/p#{page}.ttf') format('truetype');
      font-display: swap;}")
  end
end

File.open("src/styles/qcf-v2-fonts.css", "wb") do |file|
  # Generate v2 font face for each page

  1.upto(604) do |page|
    file.puts("
       @font-face {
         font-family: 'p#{page}-v2';
         src: local(QCF200#{page}),
         url('/fonts/v2/woff2/p#{page}.woff2') format('woff2'),
         url('/fonts/v2/woff/p#{page}.woff') format('woff');
        font-display: swap;}"
    )
  end
end