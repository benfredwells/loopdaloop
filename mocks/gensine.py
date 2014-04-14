#!/usr/bin/python

import math

start_x=6
end_x = 26
mid_y = 16
amp = 6
start_angle = math.radians(180)

for x in range(start_x, end_x+1):
  angle = start_angle + float(x - start_x) / float(end_x - start_x) * math.pi * 2
  print str(x) + ',' + "%.2f" % (mid_y + math.sin(angle) * amp),

print