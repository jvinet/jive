#!/bin/bash

files=(jive.js jive.base.js jive.ui.js ejs/ejs.js ejs/view.js \
       json2.js sha1.js jquery.livequery.js)

cd jive
cat >../jive.full.js <<EOT
/**
 * Jive - A Javascript Framework
 * Copyright (C) 2009 Judd Vinet <jvinet@zeroflux.org>
 */
EOT
cat ${files[*]} >>../jive.full.js

cd ..
[ -x "jsmin.py" ] && min="./jsmin.py"
[ -r "compiler.jar" ] && min="java -jar compiler.jar"

cat >jive.min.js <<EOT
/**
 * Jive - A Javascript Framework
 * Copyright (C) 2009 Judd Vinet <jvinet@zeroflux.org>
 */
EOT
cat jive.full.js | $min >>jive.min.js

