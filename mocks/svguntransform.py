#!/usr/bin/python

import fileinput

transform = (0.32, 0, 0, 0.32, 0, 0)

xx_mult = transform[0]
xy_mult = transform[1]
yx_mult = transform[2]
yy_mult = transform[3]
x_translate = transform[4]
y_translate = transform[5]

# First token is always absolute
first = True
current_relative = False

def handle_token(token):
  global first
  global current_relative
  char = token[0]
  if char >= 'a' and char <= 'z':
    current_relative = True
    print token,
  elif char >= 'A' and char <= 'Z':
    current_relative = False
    print token,
  else:
    coords = token.split(',')
    in_x = float(coords[0])
    in_y = float(coords[1])
    absolute = not current_relative or first
    first = False
    x = in_x * xx_mult + in_y * xy_mult
    y = in_y * yx_mult + in_y * yy_mult
    if absolute:
      x += x_translate
      y += y_translate
    print str(x) + ',' + str(y), 

for line in fileinput.input():
  tokens = line.split(' ')
  for token in tokens:
    handle_token(token)
  print
