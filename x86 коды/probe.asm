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

;mov ax, 2
;mov gs, ax
;mov ax, [gs: 0]

;mov [gs: 0], ax

;mov ah, 0x42
;mov dl, 0x80
;mov si, 0x01
;int 0x13

;jmp 0x0102:0x0304

;int ah

;mov al, ah

;push word[CS:0x0001]

mov ax,[bp-3]