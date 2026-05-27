import sys

palette_map = {
    '0': '.', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd', 'E': 'e', 'F': 'f'
}

def img_block(data):
    lines = data.strip().split('\n')
    out = "img`\n"
    for line in lines:
        out += "    " + " ".join(list(line)) + "\n"
    out += "`"
    return out

def create_rect(w, h, color):
    return (color * w + "\n") * h

# Instead of pure hardcoding, we just output pre-designed neat blocks for simplicity
# I'll create a nice template for each one.
# For 64x64 machines, I'll use repeating textures to simulate detail.

def generate_assets():
    code = "namespace Assets {\n"

    # Espresso Machine (64x64)
    # Metallic sleek. Slate blue (8), Dark blue (9), Navy (A=10), Highlights (7)
    esp = ""
    for y in range(64):
        row = ""
        for x in range(64):
            if y < 10 or y > 54:
                row += 'a' if x%3==0 else '1'
            elif 20 < x < 44 and 20 < y < 44:
                row += '8' if (x+y)%4==0 else '9'
            else:
                row += '7' if (x+y)%8==0 else '8'
        esp += row + "\n"
    code += f"    export const machineEspresso64 = {img_block(esp)};\n\n"

    # V60 Machine (64x64)
    v60 = ""
    for y in range(64):
        row = ""
        for x in range(64):
            if 20 < x < 44 and 10 < y < 30: # Cone
                row += '7' if x%2==0 else '8'
            elif 20 < x < 44 and 30 < y < 50: # Server
                row += '6' if (x+y)%3==0 else '0'
            elif x < 15 or x > 49: # Stand
                row += 'f' if y%2==0 else '4'
            else:
                row += '0'
        v60 += row + "\n"
    code += f"    export const machineV60_64 = {img_block(v60)};\n\n"

    # Milk Jug (64x64)
    milk = ""
    for y in range(64):
        row = ""
        for x in range(64):
            if 15 < x < 49 and 15 < y < 60:
                row += '7' if x==20 or x==21 else ('8' if x%5==0 else '9')
            else:
                row += '0'
        milk += row + "\n"
    code += f"    export const machineMilk64 = {img_block(milk)};\n\n"

    # Honey Jar (64x64)
    honey = ""
    for y in range(64):
        row = ""
        for x in range(64):
            if 10 < x < 54 and 10 < y < 54:
                row += 'e' if (x+y)%4==0 else ('3' if (x-y)%5==0 else '4')
            else:
                row += '0'
        honey += row + "\n"
    code += f"    export const machineHoney64 = {img_block(honey)};\n\n"

    # Icons (16x16)
    icon_template = "7777777777777777\n" * 16
    code += f"    export const iconMantiqueira = {img_block(icon_template.replace('7','e'))};\n\n"
    code += f"    export const iconColombia = {img_block(icon_template.replace('7','4'))};\n\n"
    code += f"    export const iconEspresso = {img_block(icon_template.replace('7','8'))};\n\n"
    code += f"    export const iconV60 = {img_block(icon_template.replace('7','f'))};\n\n"
    code += f"    export const iconMilk = {img_block(icon_template.replace('7','1'))};\n\n"
    code += f"    export const iconHoney = {img_block(icon_template.replace('7','3'))};\n\n"

    # Portraits 48x48
    # Lua (Programmer, introspective)
    port_lua = ("0" * 48 + "\n") * 10 + ("0" * 16 + "1" * 16 + "0" * 16 + "\n") * 10 + ("0" * 16 + "5" * 16 + "0" * 16 + "\n") * 28
    code += f"    export const portraitLuaImg = {img_block(port_lua)};\n\n"
    # Omar
    port_omar = ("0" * 48 + "\n") * 10 + ("0" * 16 + "a" * 16 + "0" * 16 + "\n") * 10 + ("0" * 16 + "4" * 16 + "0" * 16 + "\n") * 28
    code += f"    export const portraitOmarImg = {img_block(port_omar)};\n\n"
    # Yuki
    port_yuki = ("0" * 48 + "\n") * 10 + ("0" * 16 + "9" * 16 + "0" * 16 + "\n") * 10 + ("0" * 16 + "6" * 16 + "0" * 16 + "\n") * 28
    code += f"    export const portraitYukiImg = {img_block(port_yuki)};\n\n"
    # Alex
    port_alex = ("0" * 48 + "\n") * 10 + ("0" * 16 + "e" * 16 + "0" * 16 + "\n") * 10 + ("0" * 16 + "5" * 16 + "0" * 16 + "\n") * 28
    code += f"    export const portraitAlexImg = {img_block(port_alex)};\n\n"
    # Leo
    port_leo = ("0" * 48 + "\n") * 10 + ("0" * 16 + "3" * 16 + "0" * 16 + "\n") * 10 + ("0" * 16 + "5" * 16 + "0" * 16 + "\n") * 28
    code += f"    export const portraitLeoImg = {img_block(port_leo)};\n\n"

    code += "}\n"
    
    with open("c:\\jogo\\trabalho\\assets\\assets.ts", "w") as f:
        f.write(code)

if __name__ == "__main__":
    generate_assets()
