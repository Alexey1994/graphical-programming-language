use16

;cmp ax, 0
;je 0x0004

;push bp
;mov bp, sp
;pop bp
;ret

;push word[bp - 0x02]
;push 0x102

;mov sp, bp
;add sp, 2
;sub sp, 2

;mov word[ebp + 1], 1

;call [bp]

;mov ax, 11
;mov ss, ax
;mov byte[ss:0x8000], 1

;hlt

;mov ax, cs
;mov ds, ax
;mov ss, ax

;mov sp, 0x8000

GDT:
    dq 0                  ; dummy

                          ; CODE (CS register = 8)
    dw 0xffff             ; Segment Limit
    dw 0                  ; Base address
    db 0                  ; Base address
    db 0b10011010         ; segment present   = 1 (segment is valid)
                          ; ring              = 00 (maximum)
                          ; descriptor type   = 1 (code and data)
                          ; type              = 1010 (read/execute)
    db 0b11001111         ; Granularity       = 1 (max memory size = 4096 * Segment Limit)
                          ; 32 bit addressing = 1 (enabled)
                          ; L                 = 0
                          ; AVL               = 0
                          ; Segment Limit     = 1111
    db 0                  ; Base address

                          ; DATA (DS register = 16)
    dw 0xffff             ; Segment Limit
    dw 0                  ; Base address
    db 0                  ; Base address
    db 0b10010010         ; segment present   = 1 (segment is valid)
                          ; ring              = 00 (maximum)
                          ; descriptor type   = 1 (code and data)
                          ; type              = 0010 (read/write)
    db 0b11001111         ; Granularity       = 1 (max memory size = 4096 * Segment Limit)
                          ; 32 bit addressing = 1 (enabled)
                          ; L                 = 0
                          ; AVL               = 0
                          ; Segment Limit     = 1111
    db 0                  ; Base address

GDT_pointer:
    dw $ - GDT - 1
    dd GDT
