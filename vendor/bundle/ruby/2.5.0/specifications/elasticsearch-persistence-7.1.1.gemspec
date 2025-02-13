# -*- encoding: utf-8 -*-
# stub: elasticsearch-persistence 7.1.1 ruby lib

Gem::Specification.new do |s|
  s.name = "elasticsearch-persistence".freeze
  s.version = "7.1.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Karel Minarik".freeze]
  s.date = "2020-08-19"
  s.description = "Persistence layer for Ruby models and Elasticsearch.".freeze
  s.email = ["karel.minarik@elasticsearch.org".freeze]
  s.extra_rdoc_files = ["README.md".freeze, "LICENSE.txt".freeze]
  s.files = ["LICENSE.txt".freeze, "README.md".freeze]
  s.homepage = "https://github.com/elasticsearch/elasticsearch-rails/".freeze
  s.licenses = ["Apache 2".freeze]
  s.rdoc_options = ["--charset=UTF-8".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9.3".freeze)
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "Persistence layer for Ruby models and Elasticsearch.".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<elasticsearch>.freeze, ["~> 7"])
      s.add_runtime_dependency(%q<elasticsearch-model>.freeze, ["= 7.1.1"])
      s.add_runtime_dependency(%q<activesupport>.freeze, ["> 4"])
      s.add_runtime_dependency(%q<activemodel>.freeze, ["> 4"])
      s.add_runtime_dependency(%q<hashie>.freeze, [">= 0"])
      s.add_development_dependency(%q<bundler>.freeze, [">= 0"])
      s.add_development_dependency(%q<rake>.freeze, ["~> 12"])
      s.add_development_dependency(%q<oj>.freeze, [">= 0"])
      s.add_development_dependency(%q<rails>.freeze, ["> 4"])
      s.add_development_dependency(%q<elasticsearch-extensions>.freeze, [">= 0"])
      s.add_development_dependency(%q<minitest>.freeze, [">= 0"])
      s.add_development_dependency(%q<test-unit>.freeze, [">= 0"])
      s.add_development_dependency(%q<shoulda-context>.freeze, [">= 0"])
      s.add_development_dependency(%q<mocha>.freeze, [">= 0"])
      s.add_development_dependency(%q<turn>.freeze, [">= 0"])
      s.add_development_dependency(%q<yard>.freeze, [">= 0"])
      s.add_development_dependency(%q<ruby-prof>.freeze, [">= 0"])
      s.add_development_dependency(%q<pry>.freeze, [">= 0"])
      s.add_development_dependency(%q<simplecov>.freeze, [">= 0"])
      s.add_development_dependency(%q<cane>.freeze, [">= 0"])
    else
      s.add_dependency(%q<elasticsearch>.freeze, ["~> 7"])
      s.add_dependency(%q<elasticsearch-model>.freeze, ["= 7.1.1"])
      s.add_dependency(%q<activesupport>.freeze, ["> 4"])
      s.add_dependency(%q<activemodel>.freeze, ["> 4"])
      s.add_dependency(%q<hashie>.freeze, [">= 0"])
      s.add_dependency(%q<bundler>.freeze, [">= 0"])
      s.add_dependency(%q<rake>.freeze, ["~> 12"])
      s.add_dependency(%q<oj>.freeze, [">= 0"])
      s.add_dependency(%q<rails>.freeze, ["> 4"])
      s.add_dependency(%q<elasticsearch-extensions>.freeze, [">= 0"])
      s.add_dependency(%q<minitest>.freeze, [">= 0"])
      s.add_dependency(%q<test-unit>.freeze, [">= 0"])
      s.add_dependency(%q<shoulda-context>.freeze, [">= 0"])
      s.add_dependency(%q<mocha>.freeze, [">= 0"])
      s.add_dependency(%q<turn>.freeze, [">= 0"])
      s.add_dependency(%q<yard>.freeze, [">= 0"])
      s.add_dependency(%q<ruby-prof>.freeze, [">= 0"])
      s.add_dependency(%q<pry>.freeze, [">= 0"])
      s.add_dependency(%q<simplecov>.freeze, [">= 0"])
      s.add_dependency(%q<cane>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<elasticsearch>.freeze, ["~> 7"])
    s.add_dependency(%q<elasticsearch-model>.freeze, ["= 7.1.1"])
    s.add_dependency(%q<activesupport>.freeze, ["> 4"])
    s.add_dependency(%q<activemodel>.freeze, ["> 4"])
    s.add_dependency(%q<hashie>.freeze, [">= 0"])
    s.add_dependency(%q<bundler>.freeze, [">= 0"])
    s.add_dependency(%q<rake>.freeze, ["~> 12"])
    s.add_dependency(%q<oj>.freeze, [">= 0"])
    s.add_dependency(%q<rails>.freeze, ["> 4"])
    s.add_dependency(%q<elasticsearch-extensions>.freeze, [">= 0"])
    s.add_dependency(%q<minitest>.freeze, [">= 0"])
    s.add_dependency(%q<test-unit>.freeze, [">= 0"])
    s.add_dependency(%q<shoulda-context>.freeze, [">= 0"])
    s.add_dependency(%q<mocha>.freeze, [">= 0"])
    s.add_dependency(%q<turn>.freeze, [">= 0"])
    s.add_dependency(%q<yard>.freeze, [">= 0"])
    s.add_dependency(%q<ruby-prof>.freeze, [">= 0"])
    s.add_dependency(%q<pry>.freeze, [">= 0"])
    s.add_dependency(%q<simplecov>.freeze, [">= 0"])
    s.add_dependency(%q<cane>.freeze, [">= 0"])
  end
end
