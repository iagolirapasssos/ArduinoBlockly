#!/bin/bash

# Nome do arquivo de saída
OUTPUT_FILE="output.txt"

# Nome do próprio script
SCRIPT_NAME=$(basename "$0")

# Limpa o conteúdo do arquivo de saída
> $OUTPUT_FILE

# Função para imprimir o conteúdo do diretório e dos arquivos
print_contents() {
    local dir="$1"
    local prefix="$2"

    # Lista os conteúdos do diretório atual
    for entry in "$dir"/*; do
        local entry_name=$(basename "$entry")
        if [ "$entry_name" != "$SCRIPT_NAME" ] && [ "$entry_name" != "$OUTPUT_FILE" ]; then
            if [ -d "$entry" ]; then
                # Se for um diretório, chama a função recursivamente
                print_contents "$entry" "$prefix$entry_name/"
            else
                # Se for um arquivo, imprime o nome e o conteúdo
                echo "$prefix$entry_name:" >> $OUTPUT_FILE
                cat "$entry" >> $OUTPUT_FILE
                echo -e "\n" >> $OUTPUT_FILE
            fi
        fi
    done
}

# Chama a função print_contents a partir do diretório atual
print_contents "." ""

echo "Conteúdo listado e escrito em $OUTPUT_FILE"
