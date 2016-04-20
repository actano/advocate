SRC=src/
LIB=lib/

SRC_CHECK=$(wildcard src/check/*.coffee)
OUT_CHECK=$(addprefix ${LIB}check/,$(notdir $(SRC_CHECK:.coffee=.js)))
SRC_DETECT=$(wildcard src/detect/*.coffee)
OUT_DETECT=$(addprefix ${LIB}detect/,$(notdir $(SRC_DETECT:.coffee=.js)))
SRC_SPDX=$(wildcard src/spdx/*.coffee)
OUT_SPDX=$(addprefix ${LIB}spdx/,$(notdir $(SRC_SPDX:.coffee=.js)))

all: ${LIB}index.js ${OUT_CHECK} ${OUT_DETECT} ${OUT_SPDX}

clean: 
	rm -rf lib/*

${LIB}%.js: ${SRC}%.coffee
	coffee --compile --output $(dir $@) $<

