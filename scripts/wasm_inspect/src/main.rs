use std::env;
use std::fs;
use wasmparser::{Validator, Parser, Payload};

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("usage: wasm_inspect <file.wasm>");
        std::process::exit(2);
    }
    let path = &args[1];
    let bytes = fs::read(path).expect("failed to read wasm");

    // Try validating with default features (reference-types disabled)
    let mut validator = Validator::new();
    match validator.validate_all(&bytes) {
        Ok(_) => println!("WASM validation OK with default features (no reference-types needed)."),
        Err(e) => {
            println!("WASM validation failed: {}", e);
        }
    }

    // Iterate module payloads and print table/type/element info
    let mut parser = Parser::new(0);
    for payload in parser.parse_all(&bytes) {
        match payload {
            Ok(Payload::TypeSection(ts)) => {
                println!("TypeSection: {} entries", ts.get_count());
            }
            Ok(Payload::TableSection(mut tables)) => {
                println!("TableSection: {} entries", tables.get_count());
                for _i in 0..tables.get_count() {
                    let table = tables.read().expect("table read");
                    println!("  table element type: {:?}, limits: {:?}", table.element_type, table.initial);
                }
            }
            Ok(Payload::ElementSection(es)) => {
                println!("ElementSection: {} entries", es.get_count());
            }
            Ok(Payload::ExportSection(es)) => {
                println!("ExportSection: {} entries", es.get_count());
            }
            Ok(Payload::CustomSection(section)) => {
                let name = section.name();
                if name.contains("reference") || name.contains("refs") {
                    println!("Custom section: {}", name);
                }
            }
            _ => {}
        }
    }

    // Check for known instruction strings in the binary as fallback
    let s = String::from_utf8_lossy(&bytes);
    for pat in ["ref.func", "ref.null", "ref.is_null", "anyref", "externref", "ref.cast", "table", "elem"] {
        if s.contains(pat) {
            println!("Found textual token: {}", pat);
        }
    }

    println!("Done.");
}
