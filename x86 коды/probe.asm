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

mov sp, 0x8000