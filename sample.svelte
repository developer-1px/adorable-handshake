<script>

// Frame 1422235217
Frame("997x540 relative",

// img01
  Frame("997x540 absolute x(0) y(0) vbox(center) r(20) clip bg(#fbfbfb) b(#00000014)",

// Toolbar
    Frame("w(fill) h(54) hbox(middle) gap(89) p(10/16) bg(#fff) b(var(--02-neutral-04e7e7e7,#e7e7e7))",

// Frame 1422235175
      Frame("hbox(middle) p(2) r(8) bg(#cfcfcf33)",

// Frame 1422235172
        Frame("h(30) hbox(pack) gap(10) p(0/12) r(6) bg(#fff)",
          Text("font(14/150%) 600 c(#117ce9) nowrap", "Preview"),
        ),

// Frame 1422235173
        Frame("h(30) hbox(pack) gap(10) p(0/12) bg(#ffffff00)",
          Text("font(14/150%) 600 c(#9e9e9e) nowrap", "code"),
        ),
      ),

// Frame 1422235219
      Frame("hbox(middle) gap(14)",

// Deviece
        Frame("hbox(middle) gap(7)",
          Text("font(14/150%) 600 c(#222) nowrap", "Device"),

// Frame 1422235128
          Frame("94x34 relative vbox(left) gap(10) p(2) r(8) bg(#f5f5f5)",
            Rectangle("30x30 absolute x(2) y(2) r(6) bg(#fff)"),

// PC
            Frame("relative hbox(middle)",

// Mobile
              Frame("30x30 hbox(pack) gap(10)",
                <IconMobile />,
              ),

// Tablets
              Frame("30x30 hbox(pack) gap(10) p(7) r(6)",
                <IconTablet />,
              ),

// Desktop
              Frame("30x30 hbox(pack) gap(1) p(2/1)",
                <IconDesktop />,
              ),
            ),
          ),
        ),

// Size
        Frame("hbox(middle) gap(7)",
          Text("font(14/150%) 600 c(#222) nowrap", "Size"),

// Frame 1422235128
          Frame("94x34 relative hbox(top) p(2) r(8) bg(#f5f5f5)",
            Rectangle("30x30 absolute x(2) y(2) r(6) bg(#fff)"),
            Text("relative w(30) h(30) text(pack) font(12/150%) 600 c(#117ce9)", "L"),
            Text("relative w(30) h(30) text(pack) font(12/150%) 600 c(#222)", "S"),
            Text("relative w(30) h(30) text(pack) font(12/150%) 600 c(#222)", "M"),
          ),
        ),

// Color
        Frame("hbox(middle) gap(8)",
          Text("font(14/150%) 600 c(#222) nowrap", "Color"),

// Frame 1422235158
          Frame("104x34 hbox(middle) gap(6) p(8/12) r(8) bg(#fff) b(#e7e7e7)",
            Rectangle("16x16 r(64) bg(#117ce9) b(#22222214)"),
            Text("font(12/150%) c(#222) nowrap", "Primary"),
            <Open16 />,
          ),
        ),

// icon
        Frame("hbox(bottom) gap(8)",
          Text("font(14/150%) 600 c(#222) nowrap", "Icon"),

// Group 1422235161
          Group("40x22 relative",
            Rectangle("40x22 absolute x(0) y(0) r(54) bg(#f5f5f5)"),
            Rectangle("18x18 absolute x(2) y(2) r(61) bg(#fff)"),
          ),
        ),
      ),

// Frame 1422235120
      Frame("h(34) hbox(middle) gap(4) p(0/12) r(8) b(var(--color-neutral-gray4,#dadada))",
        <IconClipboard />
Text("font(14/150%) 600 c(#222) nowrap", "Link Copy"),
),
),

// Frame 1422235220
Frame("w(fill) h(fill) vbox(pack) clip",

// 2. filled button
  Instance("140x44 hbox(pack) gap(6) p(11/24) r(8) bg(#117ce9)",
    Text("font(15/150%) 600 c(#fff) nowrap", "button"),
  ),
),
),

// Group 1422235203
Group("140x132 absolute x(575) y(50) opacity(0)",

// Group 1422235185
  Group("140x132 absolute x(0) y(0)",
    Rectangle("140x132 absolute x(0) y(0) r(8) bg(#fff) b(#e7e7e7)"),
  ),

// Frame 1422235189
  Frame("w(116) absolute x(12) y(12) vbox(left)",

// Frame 1422235188
    Frame("w(fill) h(36) hbox(middle) gap(6) p(0/10) r(6) bg(#fff)",
      Rectangle("16x16 r(64) bg(#117ce9) b(#22222214)"),
      Text("font(12/150%) c(#222) nowrap", "Primary"),
    ),

// Frame 1422235187
    Frame("w(fill) h(36) hbox(middle) gap(6) p(0/10) r(6) bg(#fff)",
      Rectangle("16x16 r(64) bg(#222) b(#22222214)"),
      Text("font(12/150%) c(#222) nowrap", "Black"),
    ),

// Frame 1422235189
    Frame("w(fill) h(36) hbox(middle) gap(6) p(0/10) r(6) bg(#fff)",
      Rectangle("16x16 r(64) bg(#fff) b(#22222214)"),
      Text("font(12/150%) c(#222) nowrap", "White "),
    ),
  ),
),

// Toast
  Group("335x50 absolute x(331) y(544)",

// Group 1000011415
    Group("335x50 absolute x(0) y(0)",
      Rectangle("335x50 absolute x(0) y(0) r(8) bg(#117ce9)"),

// btn/tagcls_bl
      Instance("16x16 absolute x(307) y(17)",
        Rectangle("16x16 absolute x(0) y(0)"),
        Vector("9.012489318847656x9.012489318847656 absolute x(3) y(4) bg(#fff)"),
      ),
      Text("absolute x(12) y(15) w(285) font(14/20px) c(#fff)", "Link Copy가 완료되었습니다."),
    ),
  ),
),

</script>