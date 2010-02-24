#!/bin/bash

files=(jive.js waits.js hooks.js history.js store.js template.js result.js \
       base.js ui.js helpers.js util.js \
       lib/json2.js lib/sha1.js lib/jquery.livequery.js)


cd src
cat >../jive.full.js <<EOT
/**
 * Jive - A Javascript Framework
 * Copyright (C) 2009 Judd Vinet <jvinet@zeroflux.org>
 */
EOT
cat ${files[*]} >>../jive.full.js

cd ..
[ -x "jsmin.py" ] && min="./jsmin.py"
# doesn't work yet
#[ -r "compiler.jar" ] && min="java -jar compiler.jar"

cat >jive.min.js <<EOT
/**
 * Jive - A Javascript Framework
 * Copyright (C) 2009 Judd Vinet <jvinet@zeroflux.org>
 */
EOT
cat jive.full.js | $min >>jive.min.js

